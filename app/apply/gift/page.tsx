'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { GiftRecipientInfo } from '@/types/application';
import { BANKS, GIFT_CARD_OPTIONS } from '@/lib/mockData';
import { validateAccountNumber } from '@/lib/validation';
import { formatAccountNumber, validateAccountFormat } from '@/lib/bankFormats';
import { motion } from 'framer-motion';

const RELATIONSHIPS = [
    { value: 'SELF', label: '본인' },
];

export default function GiftPage() {
    const router = useRouter();
    const applicant = useApplicationStore((state) => state.applicant); // Get applicant info
    const payment = useApplicationStore((state) => state.payment); // Get payment info
    const giftRecipient = useApplicationStore((state) => state.giftRecipient);
    const setGiftRecipient = useApplicationStore((state) => state.setGiftRecipient);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [formData, setFormData] = React.useState<Partial<GiftRecipientInfo>>(
        giftRecipient || {
            relationship: 'SELF',
            residentType: 'DOMESTIC',
            name: '',
            birthDateOrRegNumber: '',
            bankCode: '',
            accountNumber: '',
            giftCardOption: 'NONE',
        }
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    // Auto-fill on initial load if relationship is SELF
    React.useEffect(() => {
        if (formData.relationship === 'SELF' && applicant && payment && !formData.name) {
            setFormData({
                ...formData,
                relationship: 'SELF',
                name: applicant.name,
                birthDateOrRegNumber: applicant.birthDate,
                residentType: 'DOMESTIC',
                bankCode: payment.bankCode || '',
                accountNumber: payment.accountNumber || '',
            });
        }
    }, [applicant, payment]); // Run when applicant or payment data is available

    const handleInputChange = (field: string, value: string) => {
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

        if (!formData.name) newErrors.name = '이름을 입력해주세요';
        if (!formData.birthDateOrRegNumber) {
            newErrors.birthDateOrRegNumber = '생년월일 또는 등록번호를 입력해주세요';
        }
        if (!formData.bankCode) newErrors.bankCode = '은행을 선택해주세요';
        if (!formData.accountNumber || !validateAccountNumber(formData.accountNumber)) {
            newErrors.accountNumber = '올바른 계좌번호를 입력해주세요';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            setGiftRecipient(formData as GiftRecipientInfo);
            setCurrentStep(4);
            router.push('/apply/terms');
        }
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            <ProgressBar currentStep={3} totalSteps={5} />

            <div className="pt-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        사은품 받을 분 정보를 입력해주세요
                    </h1>
                    <p className="text-sm text-text-secondary">
                        신세계상품권 13만 원 + 현금 💰
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {/* Recipient Info */}
                    <Input
                        label="성함을 입력해주세요"
                        conversational
                        value={formData.name || ''}
                        onChange={(value) => handleInputChange('name', value)}
                        error={errors.name}
                        placeholder="홍길동"
                    />

                    <Input
                        label="생년월일을 입력해주세요"
                        conversational
                        value={formData.birthDateOrRegNumber || ''}
                        onChange={(value) => handleInputChange('birthDateOrRegNumber', value)}
                        error={errors.birthDateOrRegNumber}
                        placeholder="1990-01-01"
                    />

                    {/* Bank Selection */}
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
                        placeholder="1234567890"
                    />

                    {/* Gift Card Option */}
                    <Select
                        label="상품권 옵션 (선택)"
                        value={formData.giftCardOption || 'NONE'}
                        onChange={(e) => handleInputChange('giftCardOption', e.target.value)}
                        options={GIFT_CARD_OPTIONS.map((g) => ({ value: g.code, label: g.name }))}
                    />

                    {/* Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs text-blue-900 leading-relaxed">
                            ※ 사은품은 가입자 본인에게만 지급됩니다.
                        </p>
                    </div>
                </div>
            </div>

            <div className="sticky-bottom">
                <Button onClick={handleNext}>다음</Button>
            </div>
        </div>
    );
}
