'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { PaymentMethod, PaymentInfo } from '@/types/application';
import { BANKS, CARD_COMPANIES } from '@/lib/mockData';
import { validateAccountNumber, validateCardNumber, validateCardExpiry } from '@/lib/validation';
import { formatAccountNumber, validateAccountFormat } from '@/lib/bankFormats';
import { motion } from 'framer-motion';

export default function PaymentPage() {
    const router = useRouter();
    const payment = useApplicationStore((state) => state.payment);
    const setPayment = useApplicationStore((state) => state.setPayment);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [formData, setFormData] = React.useState<Partial<PaymentInfo>>(
        payment || {
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
            if (!formData.cardBirthDate) {
                newErrors.cardBirthDate = '생년월일을 입력해주세요';
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
                                label="생년월일"
                                conversational
                                value={formData.cardBirthDate || ''}
                                onChange={(value) => handleInputChange('cardBirthDate', value)}
                                error={errors.cardBirthDate}
                                placeholder="YYMMDD"
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
