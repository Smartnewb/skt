'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useConsultationStore } from '@/store/consultationStore';

export default function ConsultationCompletePage() {
  const router = useRouter();
  const { customerName, reset } = useConsultationStore();

  useEffect(() => {
    if (!customerName) {
      router.push('/consultation');
    }
  }, [customerName, router]);

  const handleComplete = () => {
    reset();
    router.push('/');
  };

  if (!customerName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            className="w-10 h-10 text-green-600"
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
        </motion.div>

        <h1 className="text-2xl font-bold mb-2">상담 신청 완료</h1>
        <p className="text-gray-600 mb-6">
          {customerName}님의 상담 신청이 정상적으로 접수되었습니다.
        </p>

        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-700 mb-4">
            빠른 시일 내에 담당자가 연락드리겠습니다.
          </p>
          <div className="border-t border-purple-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">문의사항이 있으시면 아래로 연락주세요</p>
            <a
              href="tel:010-2212-7917"
              className="inline-flex items-center gap-2 text-lg font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              010-2212-7917
            </a>
          </div>
        </div>

        <Button onClick={handleComplete} className="w-full">
          처음으로
        </Button>
      </motion.div>
    </div>
  );
}
