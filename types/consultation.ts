export type ProductSpeed = '100M' | '500M' | '1G';

export type ProductBundle =
  | 'INTERNET_ONLY'
  | 'INTERNET_BTV_ECONOMY'
  | 'INTERNET_BTV_STANDARD'
  | 'INTERNET_BTV_ALL';

export type DiscountType = 'GENERAL' | 'MOBILE' | 'FAMILY';

export interface ConsultationProduct {
  speed: ProductSpeed;
  bundle: ProductBundle;
  discountType: DiscountType;
  monthlyPrice: number;
  giftAmount: number;
}

export interface ConsultationData {
  product: ConsultationProduct | null;
  customerName: string;
  customerPhone: string;
  privacyConsent: boolean;
}

export interface ConsultationDbRecord {
  id: string;
  product_speed: ProductSpeed | null;
  product_bundle: ProductBundle | null;
  discount_type: DiscountType | null;
  monthly_price: number | null;
  gift_amount: number | null;
  customer_name: string;
  customer_phone: string;
  privacy_consent: boolean;
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED';
  submitted_at: string;
  created_at: string;
  updated_at: string;
}
