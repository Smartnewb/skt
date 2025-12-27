'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AddressSearch } from '@/components/AddressSearch';
import { useApplicationStore } from '@/store/useApplicationStore';
import { CustomerType, Gender, ApplicantInfo } from '@/types/application';
import { CARRIERS } from '@/lib/mockData';
import {
    formatPhoneNumber,
    formatBusinessNumber,
    validatePhoneNumber,
    validateEmail,
    validateBirthDate,
    validateBusinessNumber
} from '@/lib/validation';
import { motion, AnimatePresence } from 'framer-motion';

const CUSTOMER_TYPES = [
    { value: 'PERSONAL', label: '개인' },
    { value: 'INDIVIDUAL_BIZ', label: '개인사업자' },
    { value: 'CORPORATE', label: '법인사업자' },
    { value: 'FOREIGNER', label: '외국인' },
];

export default function CustomerInfoPage() {
    const router = useRouter();
    const applicant = useApplicationStore((state) => state.applicant);
    const setApplicant = useApplicationStore((state) => state.setApplicant);
    const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

    const [customerType, setCustomerType] = React.useState<CustomerType>(
        applicant?.customerType || 'PERSONAL'
    );
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

    const handleCustomerTypeChange = (type: CustomerType) => {
        setCustomerType(type);
        setFormData({ ...formData, customerType: type });
    };

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
        } else if (field === 'businessRegNumber') {
            value = formatBusinessNumber(value);
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
        if (!formData.email || !validateEmail(formData.email)) {
            newErrors.email = '올바른 이메일을 입력해주세요';
        }
        if (!formData.address?.zipcode || !formData.address?.basic) {
            newErrors['address.basic'] = '주소를 입력해주세요';
        }

        // Business validation
        if (customerType === 'INDIVIDUAL_BIZ' || customerType === 'CORPORATE') {
            if (!formData.businessName) {
                newErrors.businessName = '사업자명을 입력해주세요';
            }
            if (!formData.businessRegNumber || !validateBusinessNumber(formData.businessRegNumber)) {
                newErrors.businessRegNumber = '올바른 사업자등록번호를 입력해주세요';
            }
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

    const isBusiness = customerType === 'INDIVIDUAL_BIZ' || customerType === 'CORPORATE';

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

                {/* Customer Type Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-text-primary mb-3">
                        고객 구분
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {CUSTOMER_TYPES.map((type) => (
                            <motion.button
                                key={type.value}
                                onClick={() => handleCustomerTypeChange(type.value as CustomerType)}
                                className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${customerType === type.value
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }`}
                                whileTap={{ scale: 0.97 }}
                            >
                                {type.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    <Input
                        label="성함이 어떻게 되시나요?"
                        conversational
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={errors.name}
                        placeholder="홍길동"
                    />

                    <Input
                        label="생년월일을 알려주세요"
                        conversational
                        type="text"
                        value={formData.birthDate || ''}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
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

                    {/* Business Fields (conditional) */}
                    <AnimatePresence>
                        {isBusiness && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Input
                                        label="사업자명"
                                        conversational
                                        value={formData.businessName || ''}
                                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                                        error={errors.businessName}
                                        placeholder="아정당컴퍼니"
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <Input
                                        label="사업자등록번호"
                                        conversational
                                        value={formData.businessRegNumber || ''}
                                        onChange={(e) => handleInputChange('businessRegNumber', e.target.value)}
                                        error={errors.businessRegNumber}
                                        placeholder="123-45-67890"
                                    />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

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
                        onChange={(e) => handleInputChange('contact.phone', e.target.value)}
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
                                onChange={(e) => handleInputChange('contact.emergencyPhone', e.target.value)}
                                placeholder="010-5678-9012"
                            />
                        </motion.div>
                    )}

                    <Input
                        label="이메일 주소를 알려주세요"
                        conversational
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={errors.email}
                        placeholder="example@email.com"
                    />

                    {/* Address */}
                    <div className="animate-slide-in-up">
                        <label className="label-conversational">설치 주소를 입력해주세요</label>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={formData.address?.zipcode || ''}
                                    onChange={(e) => handleInputChange('address.zipcode', e.target.value)}
                                    placeholder="우편번호"
                                    disabled
                                    className="flex-1"
                                />
                                <AddressSearch onComplete={handleAddressComplete} />
                            </div>
                            <Input
                                value={formData.address?.basic || ''}
                                onChange={(e) => handleInputChange('address.basic', e.target.value)}
                                error={errors['address.basic']}
                                placeholder="기본 주소"
                                disabled
                            />
                            <Input
                                value={formData.address?.detail || ''}
                                onChange={(e) => handleInputChange('address.detail', e.target.value)}
                                placeholder="상세 주소 (동/호수)"
                            />
                        </div>
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
