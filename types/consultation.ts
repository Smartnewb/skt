export type ProductSpeed = '100M' | '500M' | '1G';

export type ProductBundle =
  | 'INTERNET_ONLY'
  | 'INTERNET_BTV_ECONOMY'
  | 'INTERNET_BTV_STANDARD'
  | 'INTERNET_BTV_ALL';

export type DiscountType = 'GENERAL' | 'MOBILE' | 'FAMILY';

export type PreferredTime = 'ANYTIME' | 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface ConsultationProduct {
  speed: ProductSpeed;
  bundle: ProductBundle;
  discountType: DiscountType;
  monthlyPrice: number;
  giftAmount: number;
}

/**
 * Minimal public consultation payload (Phase 0).
 * Collects only name / phone / interested product / city-level region /
 * preferred contact time / privacy consent. No detailed address, birthdate,
 * account or card data.
 */
export interface ConsultationData {
  customerName: string;
  customerPhone: string;
  interestedProduct: string;
  region: string;
  preferredTime: PreferredTime;
  privacyConsent: boolean;
  consentVersion?: string;
  consentedAt?: string;
}

export interface ConsultationDbRecord {
  id: string;
  customer_name: string;
  customer_phone: string;
  interested_product: string | null;
  region: string | null;
  preferred_time: string | null;
  privacy_consent: boolean;
  consent_version: string | null;
  consented_at: string | null;
  // Legacy product-selection columns kept nullable for backward compatibility.
  product_speed: ProductSpeed | null;
  product_bundle: ProductBundle | null;
  discount_type: DiscountType | null;
  monthly_price: number | null;
  gift_amount: number | null;
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED';
  submitted_at: string;
  created_at: string;
  updated_at: string;
}
