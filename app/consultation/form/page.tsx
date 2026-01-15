'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useConsultationStore } from '@/store/consultationStore';
import { createConsultation } from '@/lib/consultationDatabase';
import { formatPhoneNumber } from '@/lib/validation';

export default function ConsultationFormPage() {
  const router = useRouter();
  const {
    customerName,
    customerPhone,
    privacyConsent,
    setCustomerName,
    setCustomerPhone,
    setPrivacyConsent,
  } = useConsultationStore();

  const [errors, setErrors] = useState<{ name?: string; phone?: string; consent?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setCustomerPhone(formatted);
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; phone?: string; consent?: string } = {};

    if (!customerName.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!customerPhone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (customerPhone.replace(/-/g, '').length !== 11) {
      newErrors.phone = '올바른 전화번호를 입력해주세요';
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
      const consultationData = {
        customerName,
        customerPhone,
        privacyConsent,
      };

      await createConsultation(consultationData);
      router.push('/consultation/complete');
    } catch (error) {
      console.error('Failed to submit consultation:', error);
      alert('상담 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            SK브로드밴드 인터넷 + TV 상담 신청
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-bold mb-6">상담 신청 정보</h2>

          <div className="space-y-4">
            <Input
              label="이름"
              value={customerName}
              onChange={setCustomerName}
              error={errors.name}
              placeholder="홍길동"
            />

            <Input
              label="전화번호"
              value={customerPhone}
              onChange={handlePhoneChange}
              error={errors.phone}
              placeholder="010-0000-0000"
              type="tel"
            />

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">개인정보 수집 및 이용 동의</h3>
              <div className="text-sm text-gray-600 mb-4 space-y-2 max-h-40 overflow-y-auto">
                <p>
                  <strong>수집 목적:</strong> 상담 서비스 제공, 고객 응대
                </p>
                <p>
                  <strong>수집 항목:</strong> 이름, 전화번호, 선택 상품 정보
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
        </motion.div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="secondary"
              className="flex-1"
              disabled={isSubmitting}
            >
              이전
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? '신청 중...' : '상담 신청하기'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
