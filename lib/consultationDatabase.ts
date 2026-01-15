import { supabase } from './supabase';
import { ConsultationData, ConsultationDbRecord } from '@/types/consultation';

export function transformConsultationToDb(
  data: ConsultationData
): Omit<ConsultationDbRecord, 'id' | 'status' | 'submitted_at' | 'created_at' | 'updated_at'> {
  return {
    product_speed: data.product?.speed || null,
    product_bundle: data.product?.bundle || null,
    discount_type: data.product?.discountType || null,
    monthly_price: data.product?.monthlyPrice || null,
    gift_amount: data.product?.giftAmount || null,
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    privacy_consent: data.privacyConsent,
  };
}

export function transformDbToConsultation(record: ConsultationDbRecord): ConsultationData {
  return {
    product: record.product_speed && record.product_bundle && record.discount_type
      ? {
          speed: record.product_speed,
          bundle: record.product_bundle,
          discountType: record.discount_type,
          monthlyPrice: record.monthly_price || 0,
          giftAmount: record.gift_amount || 0,
        }
      : null,
    customerName: record.customer_name,
    customerPhone: record.customer_phone,
    privacyConsent: record.privacy_consent,
  };
}

export async function createConsultation(data: ConsultationData): Promise<void> {
  const dbData = transformConsultationToDb(data);

  const { error } = await supabase
    .from('consultations')
    .insert(dbData);

  if (error) {
    console.error('Failed to create consultation:', error);
    throw error;
  }
}

export async function getConsultations(): Promise<ConsultationDbRecord[]> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
