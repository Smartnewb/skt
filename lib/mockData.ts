import { ProductInfo } from '@/types/application';

export const PRODUCTS: ProductInfo[] = [
    {
        id: 'prod_500m',
        speed: '500M',
        tvType: 'Btv 스탠다드',
        monthlyPrice: 38500,
        cashBenefit: 480000,
        isBest: true,
        description: '가장 많이 선택하는 베스트 상품',
    },
    {
        id: 'prod_1g',
        speed: '1G',
        tvType: 'Btv 스탠다드',
        monthlyPrice: 41800,
        cashBenefit: 480000,
        isBest: false,
        description: '빠른 속도가 필요한 분들을 위해',
    },
    {
        id: 'prod_100m',
        speed: '100M',
        tvType: 'Btv 스탠다드',
        monthlyPrice: 34100,
        cashBenefit: 430000,
        isBest: false,
        description: '유튜브, 웹서핑 위주라면 충분해요',
    },
];

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
