'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

                {/* Privacy Notice Section */}
                <div className="bg-gray-50 rounded-2xl p-6 mt-6 text-left space-y-4">
                    <div className="border-b border-gray-200 pb-3 mb-4">
                        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                            <span className="text-xl">🎁</span>
                            사은품 필수 안내사항
                        </h3>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-900 leading-relaxed">
                            사은품 수령 후 <strong>1년 이내</strong> 해지, 일시정지, 미납, 직권해지, 상품인하, 동일명의 상품 해지 시 사은품은 <strong>전액 회수</strong> 요청됩니다.
                        </p>
                    </div>

                    <div className="space-y-3 text-sm text-text-secondary">
                        <p className="leading-relaxed">
                            당사는 개인정보를 어설프게 활용하거나, 경솔하게 취급하지 않습니다. 모든 개인정보는 고시된 사항에 100% 부합되게 활용되며, 외부로 개인정보가 유출되는 일이 없습니다.
                        </p>

                        <div className="bg-white rounded-lg p-4 space-y-3">
                            <div>
                                <h4 className="font-semibold text-text-primary mb-1">📌 수집하는 개인정보 항목</h4>
                                <p className="text-xs">이름, 휴대전화, IP, 상품의 소개 및 안내, 고지사항 전달, 본인 의사 확인</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-1">📌 수집 및 이용목적</h4>
                                <p className="text-xs">당사에 제공해주신 귀하의 정보는 서비스 제공을 위한 상담목적으로 이용됩니다.</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-1">📌 개인정보의 수집범위</h4>
                                <p className="text-xs">※ 위탁 처리: 당사는 개인정보취급방침에 의한 개인정보 취급 위탁은 하지 않고 있습니다.</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-1">📌 동의 거부 권리</h4>
                                <p className="text-xs">귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다.<br/>
                                ※ 단, 동의를 거부할 경우 회원가입/서비스 이용 등 구체적 불이익이 제한될 수 있습니다.</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-1">📌 개인정보의 이용기간 및 보유기간</h4>
                                <p className="text-xs">개인정보는 상담이 종료되는 즉시 파기됩니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Action Buttons */}
                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                >
                    <Link
                        href="/"
                        onClick={handleNewApplication} // Added onClick to reset store
                        className="block w-full py-4 bg-primary text-white text-center rounded-xl font-bold text-lg hover:bg-primary-dark transition"
                    >
                        새 신청하기
                    </Link>
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
