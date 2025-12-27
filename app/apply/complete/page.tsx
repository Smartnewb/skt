'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { motion } from 'framer-motion';

export default function CompletePage() {
    const router = useRouter();
    const reset = useApplicationStore((state) => state.reset);
    const product = useApplicationStore((state) => state.product);
    const applicant = useApplicationStore((state) => state.applicant);

    const handleNewApplication = () => {
        reset();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Success Icon */}
                <div className="flex justify-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl"
                    >
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </motion.div>
                </div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl font-bold text-text-primary mb-4">
                        신청이 완료되었어요!
                    </h1>
                    <p className="text-text-secondary mb-2">
                        {applicant?.name}님, 감사합니다.
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        담당자가 곧 연락드릴 예정이니<br />
                        잠시만 기다려주세요.
                    </p>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-border mb-8"
                >
                    <h3 className="text-sm font-semibold text-text-secondary mb-4">
                        신청 내역
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-text-secondary">상품</span>
                            <span className="text-sm font-bold text-text-primary">
                                {product?.speed} + {product?.tvType}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-text-secondary">신청자</span>
                            <span className="text-sm font-bold text-text-primary">
                                {applicant?.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-text-secondary">연락처</span>
                            <span className="text-sm font-bold text-text-primary">
                                {applicant?.contact.phone}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                >
                    <Button onClick={() => router.push('/admin')}>
                        관리자 페이지 바로가기
                    </Button>
                    <button
                        onClick={handleNewApplication}
                        className="w-full py-3 text-text-secondary font-semibold"
                    >
                        새 신청하기
                    </button>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-center"
                >
                    <p className="text-xs text-text-secondary">
                        문의사항이 있으시면 고객센터로 연락주세요<br />
                        <span className="font-semibold">☎️ 1588-0000</span>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
