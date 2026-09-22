import { getSupabaseServer } from './supabaseServer';
import { ConsultationData, ConsultationDbRecord } from '@/types/consultation';

export function transformConsultationToDb(
  data: ConsultationData
): Omit<
  ConsultationDbRecord,
  | 'id'
  | 'status'
  | 'submitted_at'
  | 'created_at'
  | 'updated_at'
  | 'product_speed'
  | 'product_bundle'
  | 'discount_type'
  | 'monthly_price'
  | 'gift_amount'
> {
  // Payload contains ONLY columns granted to anon by 006_rls_lockdown.sql —
  // supplying any other column (even as NULL) fails under the column-scoped
  // INSERT grant when the server falls back to the anon key.
  return {
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    interested_product: data.interestedProduct,
    region: data.region,
    preferred_time: data.preferredTime,
    privacy_consent: data.privacyConsent,
    consent_version: data.consentVersion ?? null,
    consented_at: data.consentedAt ?? null,
  };
}

const INSERTED_COLS =
  'id, customer_phone, interested_product, region, preferred_time, submitted_at, status';

export async function createConsultation(
  data: ConsultationData
): Promise<ConsultationDbRecord | null> {
  const dbData = transformConsultationToDb(data);
  const client = getSupabaseServer();

  const { data: inserted, error } = await client
    .from('consultations')
    .insert(dbData)
    .select(INSERTED_COLS)
    .single();

  if (!error) {
    return inserted as ConsultationDbRecord;
  }

  // Under the anon fallback after 006_rls_lockdown.sql, INSERT ... RETURNING
  // needs SELECT privileges anon lacks. The failed statement is atomic —
  // nothing was written — so retry with a bare insert (return=minimal),
  // which succeeds; the caller just doesn't get the row back.
  const retry = await client.from('consultations').insert(dbData);
  if (!retry.error) {
    return null;
  }

  // Before 006_rls_lockdown.sql is applied the extras columns do not exist
  // (PostgREST PGRST204 / Postgres 42703). In that window retry with only the
  // original columns so submissions are still recorded; the extras start
  // flowing once the migration is applied.
  const missingColumn =
    retry.error.code === '42703' ||
    retry.error.code === 'PGRST204' ||
    /column .* does not exist|Could not find the .* column/i.test(retry.error.message ?? '');
  if (!missingColumn) {
    console.error('Failed to create consultation:', retry.error);
    throw retry.error;
  }
  const coreRetry = await client.from('consultations').insert({
    customer_name: dbData.customer_name,
    customer_phone: dbData.customer_phone,
    privacy_consent: dbData.privacy_consent,
  });
  if (coreRetry.error) {
    console.error('Failed to create consultation:', coreRetry.error);
    throw coreRetry.error;
  }
  return null;
}

export async function getConsultations(): Promise<ConsultationDbRecord[]> {
  const { data, error } = await getSupabaseServer()
    .from('consultations')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch consultations:', error);
    throw error;
  }

  return data as ConsultationDbRecord[];
}

export async function getConsultation(id: string): Promise<ConsultationDbRecord | null> {
  const { data, error } = await getSupabaseServer()
    .from('consultations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch consultation:', error);
    return null;
  }

  return data as ConsultationDbRecord;
}

export async function updateConsultationStatus(
  id: string,
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED'
): Promise<ConsultationDbRecord | null> {
  const { data, error } = await getSupabaseServer()
    .from('consultations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update consultation status:', error);
    return null;
  }

  return data as ConsultationDbRecord;
}

/**
 * Returns true when another consultation with the same phone already exists
 * within `windowHours`. Skips gracefully (returns false) if the check fails.
 */
export async function hasRecentConsultationByPhone(
  phone: string,
  windowHours = 24
): Promise<boolean> {
  try {
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
    const { data, error } = await getSupabaseServer()
      .from('consultations')
      .select('id')
      .eq('customer_phone', phone)
      .gte('submitted_at', since)
      .limit(1);

    if (error) {
      console.error('Dedup check failed (continuing):', error);
      return false;
    }
    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error('Dedup check errored (continuing):', error);
    return false;
  }
}
