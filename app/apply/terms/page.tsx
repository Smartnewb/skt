'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/BottomSheet';
import { useApplicationStore } from '@/store/useApplicationStore';
import { TERMS, getInitialAgreementState, areAllRequiredAgreed, areAllAgreed, type AgreementState } from '@/lib/termsData';
import { motion } from 'framer-motion';
import * as Checkbox from '@radix-ui/react-checkbox';

export default function TermsPage() {
    const router = useRouter();
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);
    const storedAgreements = useApplicationStore((state) => state.agreements);
    const setAgreements = useApplicationStore((state) => state.setAgreements);
    const applicationData = useApplicationStore((state) => ({
        product: state.product,
        applicant: state.applicant,
        payment: state.payment,
        giftRecipient: state.giftRecipient,
        agreements: state.agreements,
    }));

    const [agreements, setLocalAgreements] = React.useState<AgreementState>(
        storedAgreements || getInitialAgreementState()
    );
    const [selectedTerm, setSelectedTerm] = React.useState<typeof TERMS[number] | null>(null);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const allAgreed = areAllAgreed(agreements);
    const canProceed = areAllRequiredAgreed(agreements);

    // Handle individual checkbox change
    const handleCheckboxChange = (termId: string, checked: boolean) => {
        setLocalAgreements(prev => ({
            ...prev,
            [termId]: checked,
        }));
    };

    // Handle "전체 동의" checkbox
    const handleAllAgreeChange = (checked: boolean) => {
        const newAgreements = { ...agreements };
        TERMS.forEach(term => {
            newAgreements[term.id as keyof AgreementState] = checked;
        });
        setLocalAgreements(newAgreements);
    };

    // Open bottom sheet for specific term
    const handleTermClick = (term: typeof TERMS[number]) => {
        setSelectedTerm(term);
        setIsBottomSheetOpen(true);
    };

    // Handle bottom sheet confirm
    const handleBottomSheetConfirm = () => {
        if (selectedTerm) {
            handleCheckboxChange(selectedTerm.id, true);
        }
    };

    // Handle next button
    const handleNext = async () => {
        if (!canProceed) return;

        setIsSubmitting(true);

        try {
            setAgreements(agreements);

            const fullApplicationData = {
                ...applicationData,
                agreements,
            };

            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fullApplicationData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '가입 신청에 실패했습니다');
            }

            setCurrentStep(5);
            router.push('/apply/complete');
        } catch (error) {
            console.error('Failed to submit application:', error);
            alert(error instanceof Error ? error.message : '가입 신청에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            <ProgressBar currentStep={4} totalSteps={5} />

            <div className="pt-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        필독사항과 약관을<br />확인해주세요.
                    </h1>
                    <p className="text-sm text-text-secondary">
                        서비스 이용을 위해 동의가 필요해요
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {/* All Agree Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200"
                    >
                        <div className="flex items-center space-x-3">
                            <Checkbox.Root
                                className="w-6 h-6 rounded border-2 border-blue-400 flex items-center justify-center bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                checked={allAgreed}
                                onCheckedChange={handleAllAgreeChange}
                            >
                                <Checkbox.Indicator>
                                    <svg
                                        className="w-4 h-4 text-white"
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
                                </Checkbox.Indicator>
                            </Checkbox.Root>
                            <label className="text-base font-bold text-text-primary cursor-pointer flex-1">
                                전체 동의합니다
                            </label>
                        </div>
                    </motion.div>

                    {/* Individual Terms */}
                    <div className="space-y-3">
                        {TERMS.map((term, index) => (
                            <motion.div
                                key={term.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl p-4 border-2 border-border hover:border-gray-300 transition"
                            >
                                <div className="flex items-center space-x-3">
                                    {/* Checkbox */}
                                    <Checkbox.Root
                                        className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        checked={agreements[term.id as keyof AgreementState]}
                                        onCheckedChange={(checked) => handleCheckboxChange(term.id, checked as boolean)}
                                    >
                                        <Checkbox.Indicator>
                                            <svg
                                                className="w-3 h-3 text-white"
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
                                        </Checkbox.Indicator>
                                    </Checkbox.Root>

                                    {/* Title - Clickable */}
                                    <div
                                        onClick={() => handleTermClick(term)}
                                        className="flex-1 cursor-pointer"
                                    >
                                        <p className="text-sm font-semibold text-text-primary">
                                            {term.title}
                                            {!term.required && (
                                                <span className="ml-2 text-xs text-gray-500">(선택)</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Arrow Icon - Clickable */}
                                    <button
                                        onClick={() => handleTermClick(term)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        <svg
                                            className="w-5 h-5 text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Required Notice */}
                    {!canProceed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4"
                        >
                            <p className="text-xs text-yellow-900">
                                ⚠️ 필수 항목에 모두 동의해주세요
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Bottom Sheet Modal */}
            {selectedTerm && (
                <BottomSheet
                    isOpen={isBottomSheetOpen}
                    onClose={() => setIsBottomSheetOpen(false)}
                    title={selectedTerm.title}
                    onConfirm={handleBottomSheetConfirm}
                >
                    {selectedTerm.content}
                </BottomSheet>
            )}

            {/* Next Button - Sticky */}
            <div className="sticky-bottom">
                <Button
                    onClick={handleNext}
                    disabled={!canProceed || isSubmitting}
                >
                    {isSubmitting ? '신청 중...' : '다음'}
                </Button>
            </div>
        </div>
    );
}
