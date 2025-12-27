'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { formatCurrency } from '@/lib/validation';
import { Speed } from '@/types/application';
import { getProductsByCondition, SPEED_INFO, calculateProduct } from '@/lib/productPricing';
import { motion } from 'framer-motion';

export default function SpeedSelectPage() {
    const router = useRouter();
    const selectedCategory = useApplicationStore((state) => state.selectedCategory);
    const selectedDiscountType = useApplicationStore((state) => state.selectedDiscountType);
    const setProduct = useApplicationStore((state) => state.setProduct);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [selectedSpeed, setSelectedSpeed] = React.useState<Speed | null>(null);
    const [wifiRouter, setWifiRouter] = React.useState(true); // Default checked

    React.useEffect(() => {
        if (!selectedCategory || !selectedDiscountType) {
            router.push('/');
        }
    }, [selectedCategory, selectedDiscountType, router]);

    if (!selectedCategory || !selectedDiscountType) {
        return null;
    }

    const products = getProductsByCondition(selectedCategory, selectedDiscountType);
    const speeds: Speed[] = ['100M', '500M', '1G'];

    const handleNext = () => {
        if (selectedSpeed) {
            const finalProduct = calculateProduct(
                selectedCategory,
                selectedSpeed,
                selectedDiscountType,
                wifiRouter
            );
            setProduct(finalProduct);
            setCurrentStep(3);
            router.push('/apply/customer-info');
        }
    };

    const selectedProduct = selectedSpeed
        ? calculateProduct(selectedCategory, selectedSpeed, selectedDiscountType, wifiRouter)
        : null;

    const totalPrice = selectedProduct ? selectedProduct.monthlyPrice : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-32">
            {/* Header */}
            <div className="px-6 pt-12 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        원하시는 속도를 선택하세요
                    </h1>
                    <p className="text-lg text-text-secondary">
                        사용 인원에 맞는 속도를 추천드려요
                    </p>
                </motion.div>
            </div>

            {/* Speed Cards */}
            <div className="px-6 space-y-4">
                {speeds.map((speed, index) => {
                    const product = products.find(p => p.speed === speed);
                    const speedInfo = SPEED_INFO[speed];

                    if (!product) return null;

                    return (
                        <motion.div
                            key={speed}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                selected={selectedSpeed === speed}
                                onClick={() => setSelectedSpeed(speed)}
                                badge={product.isBest ? '🔥 BEST' : speedInfo?.popular ? '⭐ 인기' : undefined}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-text-primary mb-1">
                                            {speedInfo.name}
                                        </h3>
                                        <p className="text-sm text-text-secondary">{speedInfo.subtitle}</p>
                                        <p className="text-xs text-text-secondary mt-1">{speedInfo.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-text-secondary mb-1">월</div>
                                        <div className="text-xl font-bold text-text-primary">
                                            {formatCurrency(product.monthlyPrice)}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-blue-900">
                                            신세계상품권 13만 원 + 현금
                                        </span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(product.cashBenefit)}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* WiFi Router Option */}
            {selectedSpeed && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 mt-6"
                >
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="wifi-router"
                                    checked={wifiRouter}
                                    onChange={(e) => setWifiRouter(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <label htmlFor="wifi-router" className="cursor-pointer">
                                    <div className="font-semibold text-text-primary">
                                        📡 WiFi 공유기 포함
                                    </div>
                                    <div className="text-xs text-text-secondary mt-0.5">
                                        월 1,100원 추가
                                    </div>
                                </label>
                            </div>
                            {wifiRouter && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-primary font-bold"
                                >
                                    +1,100원
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Info */}
            <div className="px-6 mt-6">
                <p className="text-xs text-text-secondary text-center">
                    * 위 요금은 3년 약정 기준 금액이에요
                </p>
            </div>

            {selectedSpeed && (
                <motion.div
                    className="sticky-bottom"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button onClick={handleNext}>
                        다음 ({formatCurrency(totalPrice)})
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
