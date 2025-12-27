export type CustomerType = 'PERSONAL' | 'INDIVIDUAL_BIZ' | 'CORPORATE' | 'FOREIGNER';

export type Gender = 'MALE' | 'FEMALE';

export type PaymentMethod = 'BANK_TRANSFER' | 'CARD';

export type Relationship = 'SELF' | 'SPOUSE' | 'FAMILY' | 'OTHER';

export type ResidentType = 'DOMESTIC' | 'FOREIGN';

// Product category types
export type ProductCategory = 'INTERNET_ONLY' | 'INTERNET_PHONE' | 'INTERNET_TV';
export type Speed = '100M' | '500M' | '1G';
export type DiscountType = 'GENERAL' | 'MOBILE_COMBO' | 'FAMILY_COMBO';

export interface ProductInfo {
  id: string;
  category: ProductCategory;
  speed: Speed;
  tvType?: string; // Only for INTERNET_TV
  discountType: DiscountType;

  // Pricing
  monthlyPrice: number; // Final calculated price
  cashBenefit: number;

  // Metadata
  isBest: boolean;
  description: string;
  wifiRouter?: boolean;
}

// Price table structure for database
export interface PriceTable {
  category: ProductCategory;
  speed: Speed;
  tvType?: string;
  cashBenefit: number;
  prices: {
    general: number;
    mobileCombo: number;
    familyCombo: number;
  };
}

export interface ContactInfo {
  carrier: string;
  phone: string;
  emergencyPhone?: string;
}

export interface AddressInfo {
  zipcode: string;
  basic: string;
  detail: string;
}

export interface ApplicantInfo {
  customerType: CustomerType;
  name: string;
  birthDate: string;
  gender: Gender;
  businessName?: string;
  businessRegNumber?: string;
  contact: ContactInfo;
  email: string;
  address: AddressInfo;
}

export interface PaymentInfo {
  isSameAsApplicant: boolean;
  relationship: Relationship;
  method: PaymentMethod;
  bankCode?: string;
  accountNumber?: string;
  cardCompany?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardBirthOrBizNumber?: string;
}

export interface GiftRecipientInfo {
  relationship: Relationship;
  residentType: ResidentType;
  name: string;
  birthDateOrRegNumber: string;
  bankCode: string;
  accountNumber: string;
  giftCardOption?: string;
}

export interface TermsAgreement {
  all: boolean;
  required1: boolean;
  required2: boolean;
  required3: boolean;
  optional1: boolean;
  optional2: boolean;
}

export interface ApplicationData {
  product?: ProductInfo;
  applicant?: ApplicantInfo;
  payment?: PaymentInfo;
  giftRecipient?: GiftRecipientInfo;
  terms?: TermsAgreement;
  customerRequest?: string;
  submittedAt?: string;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED';
}
