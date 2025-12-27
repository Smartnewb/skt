'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { TermsAgreement } from '@/types/application';
import { motion } from 'framer-motion';
import * as Checkbox from '@radix-ui/react-checkbox';
import { createApplication } from '@/lib/database';

interface Term {
    id: keyof TermsAgreement;
    label: string;
    required: boolean;
    content: string;
}

const TERMS: Term[] = [
    {
        id: 'required1',
        label: '개인정보 수집 및 이용 동의',
        required: true,
        content: '개인정보 수집 및 이용에 대한 내용...',
    },
    {
        id: 'required2',
        label: '서비스 이용약관 동의',
        required: true,
        content: '서비스 이용약관 내용...',
    },
    {
        id: 'required3',
        label: '개인정보 제3자 제공 동의',
        required: true,
        content: '개인정보 제3자 제공에 대한 내용...',
    },
    {
        id: 'optional1',
        label: '마케팅 정보 수신 동의 (선택)',
        required: false,
        content: '마케팅 정보 수신에 대한 내용...',
    },
    {
        id: 'optional2',
        label: '이벤트 및 혜택 정보 수신 (선택)',
        required: false,
        content: '이벤트 정보 수신에 대한 내용...',
    },
];

export default function TermsPage() {
    const router = useRouter();

    // Get all application data from store
    const product = useApplicationStore((state) => state.product);
    const applicant = useApplicationStore((state) => state.applicant);
    const payment = useApplicationStore((state) => state.payment);
    const giftRecipient = useApplicationStore((state) => state.giftRecipient);
    const terms = useApplicationStore((state) => state.terms);

    const setTerms = useApplicationStore((state) => state.setTerms);
    const setCustomerRequest = useApplicationStore((state) => state.setCustomerRequest);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [agreements, setAgreements] = React.useState<TermsAgreement>(
        terms || {
            all: false,
            required1: false,
            required2: false,
            required3: false,
            optional1: false,
            optional2: false,
        }
    );
    const [customerRequestLocal, setCustomerRequestLocal] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleToggleAll = (checked: boolean) => {
        setAgreements({
            all: checked,
            required1: checked,
            required2: checked,
            required3: checked,
            optional1: checked,
            optional2: checked,
        });
    };

    const handleToggleTerm = (id: keyof TermsAgreement, checked: boolean) => {
        const newAgreements = { ...agreements, [id]: checked };

        // Update 'all' based on whether all individual terms are checked
        const allChecked = TERMS.every((term) => term.id === 'all' || newAgreements[term.id]);
        newAgreements.all = allChecked;

        setAgreements(newAgreements);
    };

    const handleViewTerms = (term: Term) => {
        alert(term.content); // In production, use a modal or bottom sheet
    };

    const allRequiredChecked = TERMS.filter((t) => t.required).every((t) => agreements[t.id]);

    const validate = () => {
        if (!allRequiredChecked) {
            alert('필수 약관에 모두 동의해주세요');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (validate()) {
            setIsSubmitting(true);

            try {
                // Update store with current local state before submitting
                setTerms(agreements);
                setCustomerRequest(customerRequestLocal);
                setCurrentStep(5);

                const applicationData = {
                    product,
                    applicant,
                    payment,
                    giftRecipient,
                    terms: agreements, // Use the current local agreements state
                    customerRequest: customerRequestLocal, // Use the current local customer request state
                    submittedAt: new Date().toISOString(),
                    status: 'PENDING' as const,
                };

                // Save to Supabase
                const savedApplication = await createApplication(applicationData);

                console.log('Application submitted successfully:', savedApplication.id);

                // Also save to localStorage as backup
                const existingApps = localStorage.getItem('applications');
                const apps = existingApps ? JSON.parse(existingApps) : [];
                apps.push(savedApplication);
                localStorage.setItem('applications', JSON.stringify(apps));

                router.push('/apply/complete');
            } catch (error) {
                console.error('Error submitting application:', error);
                alert('신청서 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                setIsSubmitting(false);
            }
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
                        마지막 단계예요 🎉
                    </h1>
                    <p className="text-sm text-text-secondary">
                        약관에 동의하고 신청을 완료해주세요
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {/* Select All */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-2xl border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                            <label className="text-lg font-bold text-blue-900">
                                전체 동의
                            </label>
                            <Checkbox.Root
                                className="w-6 h-6 rounded border-2 border-blue-400 flex items-center justify-center bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                checked={agreements.all}
                                onCheckedChange={handleToggleAll}
                            >
                                <Checkbox.Indicator>
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </Checkbox.Indicator>
                            </Checkbox.Root>
                        </div>
                    </div>

                    {/* Individual Terms */}
                    <div className="space-y-3">
                        {TERMS.map((term) => (
                            <motion.div
                                key={term.id}
                                className="bg-gray-50 p-4 rounded-xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <Checkbox.Root
                                            className="mt-1 w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            checked={agreements[term.id]}
                                            onCheckedChange={(checked) =>
                                                handleToggleTerm(term.id, checked as boolean)
                                            }
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
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </Checkbox.Indicator>
                                        </Checkbox.Root>
                                        <label className="text-sm font-semibold text-text-primary flex-1">
                                            {term.required && (
                                                <span className="text-error mr-1">[필수]</span>
                                            )}
                                            {!term.required && (
                                                <span className="text-text-secondary mr-1">[선택]</span>
                                            )}
                                            {term.label}
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => handleViewTerms(term)}
                                        className="text-xs text-text-secondary underline ml-2"
                                    >
                                        보기
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Customer Request */}
                    <div className="animate-slide-in-up">
                        <label className="block text-sm font-semibold text-text-primary mb-3">
                            고객 요청사항 (선택)
                        </label>
                        <textarea
                            className="input-field min-h-[120px] resize-none"
                            placeholder="설치나 상담 시 필요한 요청사항을 입력해주세요"
                            value={customerRequestLocal}
                            onChange={(e) => setCustomerRequestLocal(e.target.value)}
                        />
                    </div>

                    {/* Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-xs text-yellow-900 leading-relaxed">
                            ※ 신청 후 담당자가 연락드려 상담을 진행합니다.<br />
                            ※ 개통까지 영업일 기준 3-5일 소요됩니다.
                        </p>
                    </div>
                </div>
            </div>

            <div className="sticky-bottom">
                <Button
                    onClick={handleSubmit}
                    disabled={!allRequiredChecked || isSubmitting}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? '제출 중...' : '신청 완료'}
                </Button>
            </div>
        </div>
    );
}
