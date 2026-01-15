'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AddressSearch } from '@/components/AddressSearch';
import { useApplicationStore } from '@/store/useApplicationStore';
import { ApplicantInfo } from '@/types/application';
import { CARRIERS } from '@/lib/mockData';
import {
    formatPhoneNumber,
    formatBirthDate,
    validatePhoneNumber,
    validateBirthDate
} from '@/lib/validation';
import { motion } from 'framer-motion';

const CUSTOMER_TYPES = [
    { value: 'PERSONAL', label: '개인' },
];

export default function CustomerInfoPage() {
    const router = useRouter();
    const applicant = useApplicationStore((state) => state.applicant);
    const setApplicant = useApplicationStore((state) => state.setApplicant);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [formData, setFormData] = React.useState<Partial<ApplicantInfo>>(
        applicant || {
            customerType: 'PERSONAL',
            name: '',
            birthDate: '',
            gender: 'MALE',
            contact: { carrier: 'SKT', phone: '', emergencyPhone: '' },
            email: '',
            address: { zipcode: '', basic: '', detail: '' },
        }
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [showEmergencyPhone, setShowEmergencyPhone] = React.useState(false);

    const handleInputChange = (field: string, value: string) => {
        if (field.startsWith('contact.')) {
            const contactField = field.split('.')[1];
            if (contactField === 'phone' || contactField === 'emergencyPhone') {
                value = formatPhoneNumber(value);
            }
            setFormData({
                ...formData,
                contact: { ...formData.contact!, [contactField]: value },
            });
        } else if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            setFormData({
                ...formData,
                address: { ...formData.address!, [addressField]: value },
            });
        } else if (field === 'birthDate') {
            value = formatBirthDate(value);
            setFormData({ ...formData, [field]: value });
        } else {
            setFormData({ ...formData, [field]: value });
        }

        // Clear error for this field
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleAddressComplete = (data: {
        zonecode: string;
        address: string;
        buildingName?: string;
    }) => {
        setFormData({
            ...formData,
            address: {
                ...formData.address!,
                zipcode: data.zonecode,
                basic: data.address,
            },
        });

        // Clear address errors
        if (errors['address.basic']) {
            setErrors({ ...errors, 'address.basic': '' });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = '이름을 입력해주세요';
        if (!formData.birthDate || !validateBirthDate(formData.birthDate)) {
            newErrors.birthDate = '생년월일을 YYYY-MM-DD 형식으로 입력해주세요';
        }
        if (!formData.contact?.phone || !validatePhoneNumber(formData.contact.phone)) {
            newErrors['contact.phone'] = '올바른 전화번호를 입력해주세요';
        }
        if (!formData.address?.zipcode || !formData.address?.basic) {
            newErrors['address.basic'] = '주소를 입력해주세요';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            setApplicant(formData as ApplicantInfo);
            setCurrentStep(2);
            router.push('/apply/payment');
        }
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            <ProgressBar currentStep={1} totalSteps={5} />

            <div className="pt-20 px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-text-primary mb-2">
                        가입자 정보를 입력해주세요
                    </h1>
                    <p className="text-sm text-text-secondary">
                        신청 후 신분 확인 서류 제출이 필요해요
                    </p>
                </motion.div>


                {/* Form Fields */}
                <div className="space-y-5">
                    <Input
                        label="성함이 어떻게 되시나요?"
                        conversational
                        value={formData.name || ''}
                        onChange={(value) => handleInputChange('name', value)}
                        error={errors.name}
                        placeholder="홍길동"
                    />

                    <Input
                        label="생년월일을 알려주세요"
                        conversational
                        type="text"
                        value={formData.birthDate || ''}
                        onChange={(value) => handleInputChange('birthDate', value)}
                        error={errors.birthDate}
                        placeholder="1990-01-01"
                    />

                    <div className="animate-slide-in-up">
                        <label className="label-conversational">성별을 선택해주세요</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['MALE', 'FEMALE'].map((gender) => (
                                <motion.button
                                    key={gender}
                                    onClick={() => handleInputChange('gender', gender)}
                                    className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${formData.gender === gender
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                        }`}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {gender === 'MALE' ? '남성' : '여성'}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <Select
                        label="통신사를 선택해주세요"
                        conversational
                        value={formData.contact?.carrier || 'SKT'}
                        onChange={(e) => handleInputChange('contact.carrier', e.target.value)}
                        options={CARRIERS.map((c) => ({ value: c.code, label: c.name }))}
                    />

                    <Input
                        label="연락처를 알려주세요"
                        conversational
                        type="tel"
                        value={formData.contact?.phone || ''}
                        onChange={(value) => handleInputChange('contact.phone', value)}
                        error={errors['contact.phone']}
                        placeholder="010-1234-5678"
                    />

                    {!showEmergencyPhone && (
                        <button
                            onClick={() => setShowEmergencyPhone(true)}
                            className="text-sm text-primary font-semibold"
                        >
                            + 비상연락처 추가
                        </button>
                    )}

                    {showEmergencyPhone && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <Input
                                label="비상연락처"
                                type="tel"
                                value={formData.contact?.emergencyPhone || ''}
                                onChange={(value) => handleInputChange('contact.emergencyPhone', value)}
                                placeholder="010-5678-9012"
                            />
                        </motion.div>
                    )}

                    {/* Address */}
                    <div className="animate-slide-in-up">
                        <label className="label-conversational">설치 주소를 입력해주세요</label>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={formData.address?.zipcode || ''}
                                    onChange={(value) => handleInputChange('address.zipcode', value)}
                                    placeholder="우편번호"
                                    disabled
                                    className="flex-1"
                                />
                                <AddressSearch onComplete={handleAddressComplete} />
                            </div>
                            <Input
                                value={formData.address?.basic || ''}
                                onChange={(value) => handleInputChange('address.basic', value)}
                                error={errors['address.basic']}
                                placeholder="기본 주소"
                                disabled
                            />
                            <Input
                                value={formData.address?.detail || ''}
                                onChange={(value) => handleInputChange('address.detail', value)}
                                placeholder="상세 주소 (동/호수)"
                            />
                        </div>
                    </div>

                    {/* Referrer Name */}
                    <div className="animate-slide-in-up">
                        <Input
                            label="추천인 명 (선택사항)"
                            conversational
                            value={formData.referrerName || ''}
                            onChange={(value) => handleInputChange('referrerName', value)}
                            placeholder="추천인이 있으시면 입력해주세요"
                        />
                        <p className="text-xs text-text-secondary mt-2">
                            * 추천인 명을 입력하시면 추가 혜택을 받으실 수 있습니다
                        </p>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Button */}
            <div className="sticky-bottom">
                <Button onClick={handleNext}>다음</Button>
            </div>
        </div>
    );
}
