'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useConsultationStore } from '@/store/consultationStore';
import { formatPhoneNumber } from '@/lib/validation';
import { PreferredTime } from '@/types/consultation';

const PRODUCT_OPTIONS = [
  { value: '인터넷 단독', label: '인터넷 단독' },
  { value: '인터넷 + BTV 이코노미', label: '인터넷 + BTV 이코노미' },
  { value: '인터넷 + BTV 스탠다드', label: '인터넷 + BTV 스탠다드' },
  { value: '인터넷 + BTV ALL', label: '인터넷 + BTV ALL' },
  { value: '미정 (상담 후 결정)', label: '미정 (상담 후 결정)' },
];

const TIME_OPTIONS: { value: PreferredTime; label: string }[] = [
  { value: 'ANYTIME', label: '언제든지' },
  { value: 'MORNING', label: '오전 (09:00~12:00)' },
  { value: 'AFTERNOON', label: '오후 (12:00~18:00)' },
  { value: 'EVENING', label: '저녁 (18:00~21:00)' },
];

interface FormErrors {
  name?: string;
  phone?: string;
  product?: string;
  region?: string;
  consent?: string;
}

export function ConsultationForm() {
  const router = useRouter();
  const {
    customerName,
    customerPhone,
    interestedProduct,
    region,
    preferredTime,
    privacyConsent,
    setCustomerName,
    setCustomerPhone,
    setInterestedProduct,
    setRegion,
    setPreferredTime,
    setPrivacyConsent,
  } = useConsultationStore();

  // Honeypot — must remain empty; only bots fill it.
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (value: string) => {
    setCustomerPhone(formatPhoneNumber(value));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerName.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!customerPhone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^01[0-9]\d{7,8}$/.test(customerPhone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요';
    }

    if (!interestedProduct) {
      newErrors.product = '관심 상품을 선택해주세요';
    }

    if (!region.trim()) {
      newErrors.region = '설치 지역을 입력해주세요';
    } else if (/\d+\s*(동|호|층|번지)/.test(region)) {
      newErrors.region = '시/군/구까지만 입력해주세요';
    }

    if (!privacyConsent) {
      newErrors.consent = '개인정보 수집 및 이용에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone,
          interestedProduct,
          region: region.trim(),
          preferredTime,
          privacyConsent,
          website,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '상담 신청에 실패했습니다');
      }

      router.push('/consultation/complete');
    } catch (error) {
      console.error('Failed to submit consultation:', error);
      alert(error instanceof Error ? error.message : '상담 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">상담 신청 정보</h2>

      <div className="space-y-4">
        <Input
          label="이름"
          value={customerName}
          onChange={setCustomerName}
          error={errors.name}
          placeholder="홍길동"
          autoComplete="name"
          maxLength={50}
        />

        <Input
          label="전화번호"
          value={customerPhone}
          onChange={handlePhoneChange}
          error={errors.phone}
          placeholder="010-0000-0000"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
        />

        <Select
          label="관심 상품"
          value={interestedProduct}
          onChange={(e) => setInterestedProduct(e.target.value)}
          error={errors.product}
          options={PRODUCT_OPTIONS}
        />

        <Input
          label="설치 지역"
          value={region}
          onChange={setRegion}
          error={errors.region}
          placeholder="예: 서울시 강남구 (시/군/구까지만)"
          maxLength={50}
        />

        <Select
          label="연락 희망 시간"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value as PreferredTime)}
          options={TIME_OPTIONS}
        />

        {/* Honeypot — visually hidden, must stay empty */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label>
            웹사이트
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">개인정보 수집 및 이용 동의</h3>
          <div className="text-sm text-gray-600 mb-4 space-y-2 max-h-40 overflow-y-auto">
            <p>
              <strong>수집 목적:</strong> 상담 서비스 제공, 고객 응대
            </p>
            <p>
              <strong>수집 항목:</strong> 이름, 전화번호, 관심 상품, 설치 지역(시/군/구), 연락 희망 시간
            </p>
            <p>
              <strong>보유 기간:</strong> 상담 완료 후 3개월
            </p>
            <p className="text-xs text-gray-500">
              * 귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으며, 동의 거부 시 상담 서비스 이용이 제한될 수 있습니다.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm">개인정보 수집 및 이용에 동의합니다</span>
          </label>
          {errors.consent && (
            <p className="text-red-500 text-sm mt-2">{errors.consent}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? '신청 중...' : '상담 신청하기'}
        </Button>
      </div>
    </div>
  );
}
