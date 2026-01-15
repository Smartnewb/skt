import { ProductCategory, Speed, DiscountType, ProductInfo, PriceTable } from '@/types/application';

// Complete price tables for all product combinations
export const PRICE_TABLES: PriceTable[] = [
    // ========== 인터넷 단독 ==========
    {
        category: 'INTERNET_ONLY',
        speed: '100M',
        cashBenefit: 110000,
        prices: {
            general: 22000,
            mobileCombo: 17600,
            familyCombo: 16500
        }
    },
    {
        category: 'INTERNET_ONLY',
        speed: '500M',
        cashBenefit: 170000,
        prices: {
            general: 33000,
            mobileCombo: 22000,
            familyCombo: 22000
        }
    },
    {
        category: 'INTERNET_ONLY',
        speed: '1G',
        cashBenefit: 170000,
        prices: {
            general: 38500,
            mobileCombo: 25300,
            familyCombo: 27500
        }
    },

    // ========== 인터넷 + 집전화 ==========
    {
        category: 'INTERNET_PHONE',
        speed: '100M',
        cashBenefit: 110000,
        prices: {
            general: 22000,
            mobileCombo: 18700,
            familyCombo: 17600
        }
    },
    {
        category: 'INTERNET_PHONE',
        speed: '500M',
        cashBenefit: 170000,
        prices: {
            general: 31900,
            mobileCombo: 23100,
            familyCombo: 23100
        }
    },
    {
        category: 'INTERNET_PHONE',
        speed: '1G',
        cashBenefit: 170000,
        prices: {
            general: 37400,
            mobileCombo: 26400,
            familyCombo: 28600
        }
    },

    // ========== 인터넷 + BTV 이코노미 (184ch) ==========
    {
        category: 'INTERNET_TV',
        speed: '100M',
        tvType: 'Economy',
        cashBenefit: 430000,
        prices: {
            general: 34100,
            mobileCombo: 30800,
            familyCombo: 30800
        }
    },
    {
        category: 'INTERNET_TV',
        speed: '500M',
        tvType: 'Economy',
        cashBenefit: 480000,
        prices: {
            general: 41800,
            mobileCombo: 35200,
            familyCombo: 36300
        }
    },
    {
        category: 'INTERNET_TV',
        speed: '1G',
        tvType: 'Economy',
        cashBenefit: 480000,
        prices: {
            general: 47300,
            mobileCombo: 38500,
            familyCombo: 41800
        }
    },

    // ========== 인터넷 + BTV 스탠다드 (235ch) 🔥 강추 ==========
    {
        category: 'INTERNET_TV',
        speed: '100M',
        tvType: 'Standard',
        cashBenefit: 430000,
        prices: {
            general: 37400,
            mobileCombo: 34100,
            familyCombo: 34100
        }
    },
    {
        category: 'INTERNET_TV',
        speed: '500M',
        tvType: 'Standard',
        cashBenefit: 480000,
        prices: {
            general: 45100,
            mobileCombo: 38500,
            familyCombo: 39600
        }
    },
    {
        category: 'INTERNET_TV',
        speed: '1G',
        tvType: 'Standard',
        cashBenefit: 480000,
        prices: {
            general: 50600,
            mobileCombo: 41800,
            familyCombo: 45100
        }
    },

    // ========== 인터넷 + BTV ALL (261ch) ==========
    {
        category: 'INTERNET_TV',
        speed: '100M',
        tvType: 'ALL',
        cashBenefit: 430000,
        prices: {
            general: 40700,
            mobileCombo: 37400,
            familyCombo: 37400
        }
    },
    {
        category: 'INTERNET_TV',
        speed: '500M',
        tvType: 'ALL',
        cashBenefit: 480000,
        prices: {
            general: 48400,
            mobileCombo: 41800,
            familyCombo: 42900
        }
    },
    {
        category: 'INTERNET_TV',
        speed: '1G',
        tvType: 'ALL',
        cashBenefit: 480000,
        prices: {
            general: 53900,
            mobileCombo: 45100,
            familyCombo: 48400
        }
    },
];

// Category metadata
export const CATEGORY_INFO = {
    INTERNET_ONLY: {
        name: '인터넷 단독',
        description: '빠른 인터넷만 필요하신 분께',
        icon: '🌐'
    },
    INTERNET_PHONE: {
        name: '인터넷 + 집전화',
        description: '인터넷과 유선전화가 함께',
        icon: '📞'
    },
    INTERNET_TV: {
        name: '인터넷 + BTV',
        description: 'TV와 인터넷을 한번에 (가장 인기)',
        icon: '📺'
    }
};

// Speed metadata
export const SPEED_INFO = {
    '100M': {
        name: '100M',
        subtitle: '광랜',
        description: '1~2인 가구, 가벼운 인터넷 사용',
        popular: false
    },
    '500M': {
        name: '500M',
        subtitle: '기가라이트',
        description: '3~4인 가구, 영상 시청 + 재택근무',
        popular: true
    },
    '1G': {
        name: '1G',
        subtitle: '기가',
        description: '대가족, 게임 + 고화질 스트리밍',
        popular: false
    }
};

// TV Type metadata
export const TV_TYPE_INFO = {
    'Economy': {
        name: 'BTV 이코노미',
        channels: '184ch',
        description: '기본 채널 구성',
        device: '스마트3 셋탑'
    },
    'Standard': {
        name: 'BTV 스탠다드',
        channels: '235ch',
        description: '인기 채널 추가 구성',
        device: '스마트3 셋탑',
        badge: '🔥 강추'
    },
    'ALL': {
        name: 'BTV ALL',
        channels: '261ch',
        description: '모든 채널 시청 가능',
        device: '스마트3 셋탑',
        badge: '🏷️ HIT'
    }
};

// Calculate final product based on selections
export function calculateProduct(
    category: ProductCategory,
    speed: Speed,
    discountType: DiscountType,
    wifiRouter: boolean = false,
    tvType?: string
): ProductInfo {
    const table = PRICE_TABLES.find(
        t => t.category === category && t.speed === speed &&
        (category !== 'INTERNET_TV' || t.tvType === tvType)
    );

    if (!table) {
        throw new Error(`Invalid product combination: ${category} ${speed} ${tvType || ''}`);
    }

    // Get price based on discount type
    const basePrice = table.prices[
        discountType === 'GENERAL' ? 'general' :
            discountType === 'MOBILE_COMBO' ? 'mobileCombo' : 'familyCombo'
    ];

    // Add WiFi router cost if selected
    const WIFI_ROUTER_PRICE = 1100;
    const finalPrice = basePrice + (wifiRouter ? WIFI_ROUTER_PRICE : 0);

    // Determine if this is a BEST option
    const isBest = category === 'INTERNET_TV' &&
        speed === '500M' &&
        tvType === 'Standard' &&
        discountType === 'MOBILE_COMBO';

    // Generate description
    const categoryName = CATEGORY_INFO[category].name;
    const speedName = SPEED_INFO[speed].name;
    const description = `${categoryName} ${speedName}`;

    return {
        id: `${category}_${speed}_${tvType || ''}_${discountType}`,
        category,
        speed,
        tvType: table.tvType,
        discountType,
        monthlyPrice: finalPrice,
        cashBenefit: table.cashBenefit,
        isBest,
        description,
        wifiRouter
    };
}

// Get all products for a specific category and discount type
export function getProductsByCondition(
    category: ProductCategory,
    discountType: DiscountType,
    tvType?: string
): ProductInfo[] {
    const speeds: Speed[] = ['100M', '500M', '1G'];
    return speeds.map(speed => calculateProduct(category, speed, discountType, false, tvType));
}

// Legacy support - keep old PRODUCTS for backward compatibility
export const PRODUCTS = getProductsByCondition('INTERNET_TV', 'MOBILE_COMBO', 'Standard');

// Other existing data...
