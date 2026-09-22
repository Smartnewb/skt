import { getSupabaseServer } from './supabaseServer';
import { ConsultationData, ConsultationDbRecord } from '@/types/consultation';

export function transformConsultationToDb(
  data: ConsultationData
): Omit<
  ConsultationDbRecord,
  'id' | 'status' | 'submitted_at' | 'created_at' | 'updated_at'
> {
  return {
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    interested_product: data.interestedProduct,
    region: data.region,
    preferred_time: data.preferredTime,
    privacy_consent: data.privacyConsent,
    consent_version: data.consentVersion ?? null,
    consented_at: data.consentedAt ?? null,
    product_speed: null,
    product_bundle: null,
    discount_type: null,
    monthly_price: null,
    gift_amount: null,
  };
}

export async function createConsultation(
  data: ConsultationData
): Promise<ConsultationDbRecord> {
  const dbData = transformConsultationToDb(data);

  const { data: inserted, error } = await getSupabaseServer()
    .from('consultations')
    .insert(dbData)
    .select('id, customer_phone, interested_product, region, preferred_time, submitted_at, status')
    .single();

  if (error) {
    console.error('Failed to create consultation:', error);
    throw error;
  }

  return inserted as ConsultationDbRecord;
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
