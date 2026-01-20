'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { formatCurrency } from '@/lib/validation';
import { CATEGORY_INFO, SPEED_INFO, TV_TYPE_INFO, PRICE_TABLES } from '@/lib/productPricing';
import { motion } from 'framer-motion';

const DISCOUNT_TYPE_LABELS = {
    GENERAL: '일반 상품',
    MOBILE_COMBO: '휴대폰 결합',
    FAMILY_COMBO: '패밀리 결합'
};

const INSTALLATION_FEE = {
    INTERNET_ONLY: 36300,
    INTERNET_TV: 56100,
};

export default function PriceSummaryPage() {
    const router = useRouter();
    const product = useApplicationStore((state) => state.product);
    const selectedCategory = useApplicationStore((state) => state.selectedCategory);
    const selectedDiscountType = useApplicationStore((state) => state.selectedDiscountType);
    const selectedSpeed = useApplicationStore((state) => state.selectedSpeed);
    const selectedTVType = useApplicationStore((state) => state.selectedTVType);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    React.useEffect(() => {
        if (!product) {
            router.push('/');
        }
    }, [product, router]);

    if (!product || !selectedCategory || !selectedDiscountType || !selectedSpeed) {
        return null;
    }

    const categoryInfo = CATEGORY_INFO[selectedCategory];
    const speedInfo = SPEED_INFO[selectedSpeed];
    const tvInfo = selectedTVType ? TV_TYPE_INFO[selectedTVType] : null;
    const discountLabel = DISCOUNT_TYPE_LABELS[selectedDiscountType];

    const WIFI_ROUTER_PRICE = 1100;

    // Calculate discount amount
    const priceTable = PRICE_TABLES.find(
        t => t.category === selectedCategory &&
             t.speed === selectedSpeed &&
             (selectedCategory !== 'INTERNET_TV' || t.tvType === selectedTVType)
    );

    const generalPrice = priceTable?.prices.general || 0;

    let discountedPrice = generalPrice;
    if (selectedDiscountType === 'MOBILE_COMBO') {
        discountedPrice = priceTable?.prices.mobileCombo || generalPrice;
    } else if (selectedDiscountType === 'FAMILY_COMBO') {
        discountedPrice = priceTable?.prices.familyCombo || generalPrice;
    }

    const discountAmount = generalPrice - discountedPrice;

    const handleNext = () => {
        setCurrentStep(5);
        router.push('/apply/customer-info');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-32">
            {/* Header */}
            <div className="px-6 pt-12 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        최종 요금 안내
                    </h1>
                    <p className="text-lg text-text-secondary">
                        선택하신 상품의 월 요금입니다
                    </p>
                </motion.div>
            </div>

            {/* Price Summary Card */}
            <div className="px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                >
                    {/* Total Price */}
                    <div className="text-center mb-6 pb-6 border-b-2 border-gray-200">
                        <div className="text-sm text-text-secondary mb-2">월 최종 요금</div>
                        <div className="text-4xl font-bold text-primary mb-1">
                            {formatCurrency(product.monthlyPrice)}
                        </div>
                        <div className="text-xs text-text-secondary">
                            (VAT 포함, 3년 약정 기준)
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-text-primary">상품 구성</div>
                                <div className="text-sm text-text-secondary">
                                    {categoryInfo.icon} {categoryInfo.name}
                                </div>
                            </div>
                        </div>

                        {tvInfo && (
                            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                                <div>
                                    <div className="font-semibold text-text-primary">📺 {tvInfo.name}</div>
                                    <div className="text-xs text-text-secondary">
                                        {tvInfo.channels} • {tvInfo.device}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-text-primary">인터넷 속도</div>
                                <div className="text-sm text-text-secondary">
                                    {speedInfo.name} ({speedInfo.subtitle})
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-text-primary">할인 유형</div>
                                <div className="text-sm text-text-secondary">{discountLabel}</div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-text-secondary">정상 요금</span>
                                <span className="font-semibold">{formatCurrency(generalPrice)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-primary font-semibold">
                                        {selectedDiscountType === 'MOBILE_COMBO' ? '📱 휴대폰 결합 할인' : '👨‍👩‍👧‍👦 패밀리 결합 할인'}
                                    </span>
                                    <span className="font-semibold text-primary">-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            {product.wifiRouter && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-text-secondary">📡 WiFi 공유기</span>
                                    <span className="font-semibold">+{formatCurrency(WIFI_ROUTER_PRICE)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="font-bold text-text-primary">월 최종 요금</span>
                                <span className="text-xl font-bold text-primary">
                                    {formatCurrency(product.monthlyPrice)}
                                </span>
                            </div>

                            {/* 설치비 */}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-300">
                                <span className="text-sm text-text-secondary">🔧 설치비</span>
                                <div className="text-right">
                                    <span className="font-semibold">
                                        {formatCurrency(selectedCategory === 'INTERNET_TV' ? INSTALLATION_FEE.INTERNET_TV : INSTALLATION_FEE.INTERNET_ONLY)}
                                    </span>
                                    <span className="text-xs text-text-secondary ml-1">[부가세포함]</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Benefits Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 mb-6 text-white"
                >
                    <div className="text-center">
                        <div className="text-sm mb-2 opacity-90">🎁 사은품 혜택</div>
                        <div className="text-3xl font-bold mb-2">
                            {formatCurrency(product.cashBenefit)}
                        </div>
                        <div className="text-xs opacity-90">
                            신세계 상품권 13만원 + 현금 {formatCurrency(product.cashBenefit - 130000)} (당일 지급 조건)
                        </div>
                    </div>
                </motion.div>

                {/* Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-50 rounded-xl p-4"
                >
                    <h3 className="font-semibold text-text-primary mb-2">📌 안내사항</h3>
                    <ul className="text-xs text-text-secondary space-y-1">
                        <li>• 위 요금은 3년 약정 기준이며, VAT가 포함된 금액입니다</li>
                        <li>• 사은품은 신세계상품권 + 현금 지급 합산 기준입니다</li>
                        <li>• 설치 및 개통 후 사은품이 당일 지급됩니다</li>
                        <li>• 약정 기간 내 해지 시 위약금이 발생할 수 있습니다</li>
                    </ul>
                </motion.div>
            </div>

            {/* Sticky Bottom Button */}
            <motion.div
                className="sticky-bottom"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <Button onClick={handleNext}>
                    가입 신청하기
                </Button>
            </motion.div>
        </div>
    );
}
