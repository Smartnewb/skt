import {
  ProductSpeed,
  ProductBundle,
  DiscountType,
  ConsultationProduct,
} from '@/types/consultation';

interface PricingData {
  monthlyPrice: number;
  giftAmount: number;
}

type PricingTable = {
  [key in ProductBundle]: {
    [key in ProductSpeed]: {
      [key in DiscountType]: PricingData;
    };
  };
};

export const PRICING_TABLE: PricingTable = {
  INTERNET_ONLY: {
    '100M': {
      GENERAL: { monthlyPrice: 22000, giftAmount: 110000 },
      MOBILE: { monthlyPrice: 17600, giftAmount: 110000 },
      FAMILY: { monthlyPrice: 16500, giftAmount: 110000 },
    },
    '500M': {
      GENERAL: { monthlyPrice: 33000, giftAmount: 170000 },
      MOBILE: { monthlyPrice: 22000, giftAmount: 170000 },
      FAMILY: { monthlyPrice: 22000, giftAmount: 170000 },
    },
    '1G': {
      GENERAL: { monthlyPrice: 38500, giftAmount: 170000 },
      MOBILE: { monthlyPrice: 25300, giftAmount: 170000 },
      FAMILY: { monthlyPrice: 27500, giftAmount: 170000 },
    },
  },
  INTERNET_BTV_ECONOMY: {
    '100M': {
      GENERAL: { monthlyPrice: 34100, giftAmount: 430000 },
      MOBILE: { monthlyPrice: 30800, giftAmount: 430000 },
      FAMILY: { monthlyPrice: 30800, giftAmount: 430000 },
    },
    '500M': {
      GENERAL: { monthlyPrice: 41800, giftAmount: 480000 },
      MOBILE: { monthlyPrice: 35200, giftAmount: 480000 },
      FAMILY: { monthlyPrice: 36300, giftAmount: 480000 },
    },
    '1G': {
      GENERAL: { monthlyPrice: 47300, giftAmount: 480000 },
      MOBILE: { monthlyPrice: 38500, giftAmount: 480000 },
      FAMILY: { monthlyPrice: 41800, giftAmount: 480000 },
    },
  },
  INTERNET_BTV_STANDARD: {
    '100M': {
      GENERAL: { monthlyPrice: 37400, giftAmount: 430000 },
      MOBILE: { monthlyPrice: 34100, giftAmount: 430000 },
      FAMILY: { monthlyPrice: 34100, giftAmount: 430000 },
    },
    '500M': {
      GENERAL: { monthlyPrice: 45100, giftAmount: 480000 },
      MOBILE: { monthlyPrice: 38500, giftAmount: 480000 },
      FAMILY: { monthlyPrice: 39600, giftAmount: 480000 },
    },
    '1G': {
      GENERAL: { monthlyPrice: 50600, giftAmount: 480000 },
      MOBILE: { monthlyPrice: 41800, giftAmount: 480000 },
      FAMILY: { monthlyPrice: 45100, giftAmount: 480000 },
    },
  },
  INTERNET_BTV_ALL: {
    '100M': {
      GENERAL: { monthlyPrice: 40700, giftAmount: 430000 },
      MOBILE: { monthlyPrice: 37400, giftAmount: 430000 },
      FAMILY: { monthlyPrice: 37400, giftAmount: 430000 },
    },
    '500M': {
      GENERAL: { monthlyPrice: 48400, giftAmount: 480000 },
      MOBILE: { monthlyPrice: 41800, giftAmount: 480000 },
      FAMILY: { monthlyPrice: 42900, giftAmount: 480000 },
    },
    '1G': {
      GENERAL: { monthlyPrice: 53900, giftAmount: 480000 },
      MOBILE: { monthlyPrice: 45100, giftAmount: 480000 },
      FAMILY: { monthlyPrice: 48400, giftAmount: 480000 },
    },
  },
};

export const BUNDLE_NAMES: Record<ProductBundle, string> = {
  INTERNET_ONLY: '인터넷 단독',
  INTERNET_BTV_ECONOMY: '인터넷 + BTV 이코노미',
  INTERNET_BTV_STANDARD: '인터넷 + BTV 스탠다드',
  INTERNET_BTV_ALL: '인터넷 + BTV ALL',
};

export const BUNDLE_DESCRIPTIONS: Record<ProductBundle, string> = {
  INTERNET_ONLY: '',
  INTERNET_BTV_ECONOMY: '184ch, 기본: 스마트3 셋탑',
  INTERNET_BTV_STANDARD: '235ch, 기본: 스마트3 셋탑',
  INTERNET_BTV_ALL: '261ch, 기본: 스마트3 셋탑',
};

export const BUNDLE_BADGES: Record<ProductBundle, string | null> = {
  INTERNET_ONLY: null,
  INTERNET_BTV_ECONOMY: null,
  INTERNET_BTV_STANDARD: '🔥 강추 / HIT',
  INTERNET_BTV_ALL: '🏷️ HIT',
};

export const SPEED_NAMES: Record<ProductSpeed, string> = {
  '100M': '100메가',
  '500M': '500메가',
  '1G': '1기가',
};

export const SPEED_DESCRIPTIONS: Record<ProductSpeed, string> = {
  '100M': '기본형',
  '500M': '기가라이트',
  '1G': '기가',
};

export const DISCOUNT_NAMES: Record<DiscountType, string> = {
  GENERAL: '일반상품',
  MOBILE: '휴대폰 결합',
  FAMILY: '패밀리 결합',
};

export function createConsultationProduct(
  speed: ProductSpeed,
  bundle: ProductBundle,
  discountType: DiscountType
): ConsultationProduct {
  const pricing = PRICING_TABLE[bundle][speed][discountType];

  return {
    speed,
    bundle,
    discountType,
    monthlyPrice: pricing.monthlyPrice,
    giftAmount: pricing.giftAmount,
  };
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function formatGiftAmount(amount: number): string {
  const formatted = Math.floor(amount / 10000);
  return `${formatted}만원`;
}
