'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Relationship, ResidentType, GiftRecipientInfo } from '@/types/application';
import { BANKS, GIFT_CARD_OPTIONS } from '@/lib/mockData';
import { validateAccountNumber } from '@/lib/validation';
import { motion } from 'framer-motion';

const RELATIONSHIPS = [
    { value: 'SELF', label: '본인' },
    { value: 'SPOUSE', label: '배우자' },
    { value: 'FAMILY', label: '가족' },
    { value: 'OTHER', label: '기타' },
];

export default function GiftPage() {
    const router = useRouter();
    const applicant = useApplicationStore((state) => state.applicant); // Get applicant info
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

    const handleInputChange = (field: string, value: string) => {
        // Auto-fill when SELF is selected
        if (field === 'relationship' && value === 'SELF' && applicant) {
            setFormData({
                ...formData,
                relationship: 'SELF',
                name: applicant.name,
                birthDateOrRegNumber: applicant.birthDate,
                residentType: 'DOMESTIC',
            });
        } else {
            setFormData({ ...formData, [field]: value });
        }

        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const showResidentTypeSelector =
        formData.relationship === 'SPOUSE' ||
        formData.relationship === 'FAMILY' ||
        formData.relationship === 'OTHER';

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
                        가장 중요한 혜택을 받을 곳이에요 💰
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {/* Relationship */}
                    <div className="animate-slide-in-up">
                        <label className="label-conversational">받으실 분과의 관계</label>
                        <div className="grid grid-cols-2 gap-3">
                            {RELATIONSHIPS.map((rel) => (
                                <motion.button
                                    key={rel.value}
                                    onClick={() => handleInputChange('relationship', rel.value)}
                                    className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${formData.relationship === rel.value
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                        }`}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {rel.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Resident Type Selector (conditional) */}
                    {showResidentTypeSelector && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="animate-slide-in-up"
                        >
                            <label className="block text-sm font-semibold text-text-primary mb-3">
                                내국인/외국인
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <motion.button
                                    onClick={() => handleInputChange('residentType', 'DOMESTIC')}
                                    className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${formData.residentType === 'DOMESTIC'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                        }`}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    내국인
                                </motion.button>
                                <motion.button
                                    onClick={() => handleInputChange('residentType', 'FOREIGN')}
                                    className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${formData.residentType === 'FOREIGN'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                        }`}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    외국인
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Recipient Info */}
                    <Input
                        label="성함을 입력해주세요"
                        conversational
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={errors.name}
                        placeholder="홍길동"
                    />

                    <Input
                        label={
                            formData.residentType === 'FOREIGN'
                                ? '외국인등록번호를 입력해주세요'
                                : '생년월일을 입력해주세요'
                        }
                        conversational
                        value={formData.birthDateOrRegNumber || ''}
                        onChange={(e) => handleInputChange('birthDateOrRegNumber', e.target.value)}
                        error={errors.birthDateOrRegNumber}
                        placeholder={formData.residentType === 'FOREIGN' ? '123456-1234567' : '1990-01-01'}
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
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
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
                            ※ 사은품 계좌는 가입자 정보와 동일해야 합니다.
                            (가족일 경우 증빙 서류 제출 시 가능)
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
