'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApplicationStore } from '@/store/useApplicationStore';
import { DiscountType } from '@/types/application';

export default function DiscountCheckPage() {
    const router = useRouter();
    const selectedCategory = useApplicationStore((state) => state.selectedCategory);
    const setDiscountType = useApplicationStore((state) => state.setDiscountType);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [hasSKTMobile, setHasSKTMobile] = React.useState<boolean | null>(null);
    const [hasSKTInternet, setHasSKTInternet] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        if (!selectedCategory) {
            router.push('/');
        }
    }, [selectedCategory, router]);

    const handleNext = (discountType: DiscountType) => {
        setDiscountType(discountType);
        setCurrentStep(2);
        router.push('/apply/speed-select');
    };

    // Step 1: Check for mobile combo
    if (hasSKTMobile === null) {
        return (
            <div className="min-h-screen bg-white pb-32">
                <div className="pt-20 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                            할인 혜택을 확인해볼까요?
                        </h1>
                        <p className="text-sm text-text-secondary">
                            조금만 답해주시면 최저가를 찾아드려요 🎯
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <label className="label-conversational">
                            SK텔레콤/SK7모바일 휴대폰을<br />사용하시는 분이 계신가요?
                        </label>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <motion.button
                                onClick={() => {
                                    setHasSKTMobile(true);
                                    handleNext('MOBILE_COMBO');
                                }}
                                className="py-4 px-4 rounded-xl font-semibold text-base bg-primary text-white hover:bg-primary-dark transition"
                                whileTap={{ scale: 0.97 }}
                            >
                                네, 있어요 ✅
                            </motion.button>
                            <motion.button
                                onClick={() => setHasSKTMobile(false)}
                                className="py-4 px-4 rounded-xl font-semibold text-base bg-gray-100 text-text-secondary hover:bg-gray-200 transition"
                                whileTap={{ scale: 0.97 }}
                            >
                                아니요
                            </motion.button>
                        </div>
                        <p className="text-xs text-text-secondary mt-3">
                            💡 SK 휴대폰을 쓰시면 가장 저렴해요!
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Step 2: Check for family combo (if no mobile)
    return (
        <div className="min-h-screen bg-white pb-32">
            <div className="pt-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        한 가지만 더 확인할게요
                    </h1>
                    <p className="text-sm text-text-secondary">
                        추가 할인 받으실 수 있어요!
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <label className="label-conversational">
                        가족 중에 SK브로드밴드 인터넷을<br />사용하시는 분이 계신가요?
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <motion.button
                            onClick={() => handleNext('FAMILY_COMBO')}
                            className="py-4 px-4 rounded-xl font-semibold text-base bg-primary text-white hover:bg-primary-dark transition"
                            whileTap={{ scale: 0.97 }}
                        >
                            네, 있어요 ✅
                        </motion.button>
                        <motion.button
                            onClick={() => handleNext('GENERAL')}
                            className="py-4 px-4 rounded-xl font-semibold text-base bg-gray-100 text-text-secondary hover:bg-gray-200 transition"
                            whileTap={{ scale: 0.97 }}
                        >
                            아니요
                        </motion.button>
                    </div>
                    <p className="text-xs text-text-secondary mt-3">
                        💡 가족 결합 시에도 할인 혜택이 있어요!
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
