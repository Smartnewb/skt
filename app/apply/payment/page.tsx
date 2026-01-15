'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { PaymentMethod, Relationship, PaymentInfo } from '@/types/application';
import { BANKS, CARD_COMPANIES } from '@/lib/mockData';
import { validateAccountNumber, validateCardNumber, validateCardExpiry } from '@/lib/validation';
import { formatAccountNumber, validateAccountFormat } from '@/lib/bankFormats';
import { motion } from 'framer-motion';
import * as Checkbox from '@radix-ui/react-checkbox';

const RELATIONSHIPS = [
    { value: 'SELF', label: '본인' },
];

export default function PaymentPage() {
    const router = useRouter();
    const applicant = useApplicationStore((state) => state.applicant);
    const payment = useApplicationStore((state) => state.payment);
    const setPayment = useApplicationStore((state) => state.setPayment);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [formData, setFormData] = React.useState<Partial<PaymentInfo>>(
        payment || {
            isSameAsApplicant: false,
            relationship: 'SELF',
            method: 'BANK_TRANSFER',
        }
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleSameAsApplicantChange = (checked: boolean) => {
        if (checked && applicant) {
            setFormData({
                ...formData,
                isSameAsApplicant: true,
                relationship: 'SELF',
            });
        } else {
            setFormData({ ...formData, isSameAsApplicant: false });
        }
    };

    // Handle account number input with auto-formatting
    const handleAccountNumberChange = (value: string) => {
        if (formData.bankCode) {
            const formatted = formatAccountNumber(formData.bankCode, value);
            setFormData({ ...formData, accountNumber: formatted });
        } else {
            const cleaned = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, accountNumber: cleaned });
        }
        if (errors.accountNumber) {
            setErrors({ ...errors, accountNumber: '' });
        }
    };

    // Reformat when bank changes
    React.useEffect(() => {
        if (formData.bankCode && formData.accountNumber) {
            const formatted = formatAccountNumber(formData.bankCode, formData.accountNumber);
            if (formatted !== formData.accountNumber) {
                setFormData(prev => ({ ...prev, accountNumber: formatted }));
            }
        }
    }, [formData.bankCode]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (formData.method === 'BANK_TRANSFER') {
            if (!formData.bankCode) newErrors.bankCode = '은행을 선택해주세요';
            if (!formData.accountNumber || !validateAccountNumber(formData.accountNumber)) {
                newErrors.accountNumber = '올바른 계좌번호를 입력해주세요';
            }
        } else if (formData.method === 'CARD') {
            if (!formData.cardCompany) newErrors.cardCompany = '카드사를 선택해주세요';
            if (!formData.cardNumber || !validateCardNumber(formData.cardNumber)) {
                newErrors.cardNumber = '올바른 카드번호를 입력해주세요';
            }
            if (!formData.cardExpiry || !validateCardExpiry(formData.cardExpiry)) {
                newErrors.cardExpiry = '유효기간을 MM/YY 형식으로 입력해주세요';
            }
            if (!formData.cardBirthOrBizNumber) {
                newErrors.cardBirthOrBizNumber = '생년월일 또는 사업자번호를 입력해주세요';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            setPayment(formData as PaymentInfo);
            setCurrentStep(3);
            router.push('/apply/gift');
        }
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            <ProgressBar currentStep={2} totalSteps={5} />

            <div className="pt-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        납부 정보를 입력해주세요
                    </h1>
                    <p className="text-sm text-text-secondary">
                        매달 요금이 결제될 정보예요
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {/* Same as Applicant Checkbox */}
                    <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl">
                        <Checkbox.Root
                            className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            checked={formData.isSameAsApplicant}
                            onCheckedChange={handleSameAsApplicantChange}
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
                        <label className="text-sm font-semibold text-text-primary">
                            가입자 정보와 동일합니다
                        </label>
                    </div>


                    {/* Payment Method Selection */}
                    <div className="animate-slide-in-up">
                        <label className="label-conversational">납부 방식</label>
                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                onClick={() => handleInputChange('method', 'BANK_TRANSFER')}
                                className={`py-4 px-4 rounded-xl font-semibold transition-all ${formData.method === 'BANK_TRANSFER'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }`}
                                whileTap={{ scale: 0.97 }}
                            >
                                은행 자동이체
                            </motion.button>
                            <motion.button
                                onClick={() => handleInputChange('method', 'CARD')}
                                className={`py-4 px-4 rounded-xl font-semibold transition-all ${formData.method === 'CARD'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }`}
                                whileTap={{ scale: 0.97 }}
                            >
                                카드 결제
                            </motion.button>
                        </div>
                    </div>

                    {/* Bank Transfer Fields */}
                    {formData.method === 'BANK_TRANSFER' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-5"
                        >
                            <Select
                                label="은행을 선택해주세요"
                                conversational
                                value={formData.bankCode || ''}
                                onChange={(e) => handleInputChange('bankCode', e.target.value)}
                                error={errors.bankCode}
                                options={BANKS.map((b) => ({ value: b.code, label: b.name }))}
                            />

                            <Input
                                label="계좌번호를 입력해주세요"
                                conversational
                                value={formData.accountNumber || ''}
                                onChange={handleAccountNumberChange}
                                error={errors.accountNumber}
                                placeholder="숫자만 입력하세요" maxLength={20}
                            />

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-xs text-yellow-900">
                                    ※ 평생계좌, 카카오 모임통장은 사용할 수 없어요
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Card Payment Fields */}
                    {formData.method === 'CARD' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-5"
                        >
                            <Select
                                label="카드사를 선택해주세요"
                                conversational
                                value={formData.cardCompany || ''}
                                onChange={(e) => handleInputChange('cardCompany', e.target.value)}
                                error={errors.cardCompany}
                                options={CARD_COMPANIES.map((c) => ({ value: c.code, label: c.name }))}
                            />

                            <Input
                                label="카드번호를 입력해주세요"
                                conversational
                                value={formData.cardNumber || ''}
                                onChange={(value) => handleInputChange('cardNumber', value)}
                                error={errors.cardNumber}
                                placeholder="1234-5678-9012-3456"
                            />

                            <Input
                                label="유효기간"
                                conversational
                                value={formData.cardExpiry || ''}
                                onChange={(value) => handleInputChange('cardExpiry', value)}
                                error={errors.cardExpiry}
                                placeholder="MM/YY"
                            />

                            <Input
                                label="생년월일 또는 사업자번호"
                                conversational
                                value={formData.cardBirthOrBizNumber || ''}
                                onChange={(value) => handleInputChange('cardBirthOrBizNumber', value)}
                                error={errors.cardBirthOrBizNumber}
                                placeholder="YYMMDD 또는 사업자번호"
                            />
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="sticky-bottom">
                <Button onClick={handleNext}>다음</Button>
            </div>
        </div>
    );
}
