import { ProductInfo } from '@/types/application';

// Re-export from productPricing for backward compatibility
export { PRODUCTS, CATEGORY_INFO, SPEED_INFO, calculateProduct, getProductsByCondition } from './productPricing';

export const BANKS = [
    { code: 'KB', name: 'KB국민은행' },
    { code: 'SH', name: '신한은행' },
    { code: 'WR', name: '우리은행' },
    { code: 'HN', name: '하나은행' },
    { code: 'NH', name: 'NH농협은행' },
    { code: 'KK', name: '카카오뱅크' },
    { code: 'TOS', name: '토스뱅크' },
    { code: 'IBK', name: 'IBK기업은행' },
    { code: 'SC', name: 'SC제일은행' },
];

export const CARRIERS = [
    { code: 'SKT', name: 'SKT' },
    { code: 'KT', name: 'KT' },
    { code: 'LGU', name: 'LG U+' },
    { code: 'MVNO', name: '알뜰폰' },
];

export const GIFT_CARD_OPTIONS = [
    { code: 'NONE', name: '전액 현금' },
    { code: 'SHINSEGAE', name: '신세계 상품권' },
    { code: 'HOMEPLUS', name: '홈플러스 상품권' },
];

export const CARD_COMPANIES = [
    { code: 'SH', name: '신한카드' },
    { code: 'KB', name: 'KB국민카드' },
    { code: 'SS', name: '삼성카드' },
    { code: 'HD', name: '현대카드' },
    { code: 'LT', name: '롯데카드' },
    { code: 'WR', name: '우리카드' },
    { code: 'NH', name: 'NH농협카드' },
    { code: 'BC', name: 'BC카드' },
];
