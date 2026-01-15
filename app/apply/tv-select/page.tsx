'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { TVType } from '@/types/application';
import { TV_TYPE_INFO, calculateProduct } from '@/lib/productPricing';
import { motion } from 'framer-motion';

export default function TVSelectPage() {
    const router = useRouter();
    const selectedCategory = useApplicationStore((state) => state.selectedCategory);
    const selectedDiscountType = useApplicationStore((state) => state.selectedDiscountType);
    const selectedSpeed = useApplicationStore((state) => state.selectedSpeed);
    const setTVType = useApplicationStore((state) => state.setTVType);
    const setProduct = useApplicationStore((state) => state.setProduct);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [selectedTVType, setSelectedTVTypeState] = React.useState<TVType | null>(null);

    React.useEffect(() => {
        if (!selectedCategory || !selectedDiscountType) {
            router.push('/');
        }
        // If no speed selected, go back to speed selection
        if (!selectedSpeed) {
            router.push('/apply/speed-select');
        }
    }, [selectedCategory, selectedDiscountType, selectedSpeed, router]);

    if (!selectedCategory || !selectedDiscountType || !selectedSpeed) {
        return null;
    }

    const handleNext = () => {
        if (selectedTVType && selectedSpeed) {
            setTVType(selectedTVType);
            // Calculate final product with speed and TV type
            const finalProduct = calculateProduct(
                selectedCategory,
                selectedSpeed,
                selectedDiscountType,
                true, // wifiRouter default to true
                selectedTVType
            );
            setProduct(finalProduct);
            setCurrentStep(4);
            router.push('/apply/price-summary');
        }
    };

    const tvTypes: TVType[] = ['Economy', 'Standard', 'ALL'];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-32">
            {/* Header */}
            <div className="px-6 pt-12 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        BTV 상품을 선택하세요
                    </h1>
                    <p className="text-lg text-text-secondary">
                        시청하시는 채널에 맞는 상품을 추천드려요
                    </p>
                </motion.div>
            </div>

            {/* TV Type Cards */}
            <div className="px-6 space-y-4">
                {tvTypes.map((tvType, index) => {
                    const tvInfo = TV_TYPE_INFO[tvType];

                    return (
                        <motion.div
                            key={tvType}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                selected={selectedTVType === tvType}
                                onClick={() => setSelectedTVTypeState(tvType)}
                                badge={tvInfo.badge || undefined}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-3xl">📺</span>
                                            <div>
                                                <h3 className="text-xl font-bold text-text-primary">
                                                    {tvInfo.name}
                                                </h3>
                                                <p className="text-sm text-text-secondary">
                                                    {tvInfo.channels} • {tvInfo.device}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-text-secondary mt-2">
                                            {tvInfo.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="px-6 mt-6">
                <p className="text-xs text-text-secondary text-center">
                    * TV 상품을 선택하시면 가격 요약을 확인하실 수 있습니다
                </p>
            </div>

            {selectedTVType && (
                <motion.div
                    className="sticky-bottom"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button onClick={handleNext}>
                        다음
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
