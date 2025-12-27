'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { useApplicationStore } from '@/store/useApplicationStore';
import { ProductCategory } from '@/types/application';
import { CATEGORY_INFO } from '@/lib/productPricing';

export default function HomePage() {
  const router = useRouter();
  const setCategory = useApplicationStore((state) => state.setCategory);
  const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory | null>(null);

  const handleNext = () => {
    if (selectedCategory) {
      setCategory(selectedCategory);
      setCurrentStep(1);
      router.push('/apply/discount-check');
    }
  };

  const categories: ProductCategory[] = ['INTERNET_TV', 'INTERNET_ONLY', 'INTERNET_PHONE'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-32">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            퍼펙트PC통신 X SK브로드밴드 인터넷 신청
          </h1>
          <p className="text-lg text-text-secondary">
            어떤 상품이 필요하세요?
          </p>
        </motion.div>
      </div>

      {/* Category Cards */}
      <div className="px-6 space-y-4">
        {categories.map((category, index) => {
          const info = CATEGORY_INFO[category];
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                selected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                badge={category === 'INTERNET_TV' ? '🔥 가장 많이 선택해요' : undefined}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{info.icon}</span>
                      <h3 className="text-xl font-bold text-text-primary">
                        {info.name}
                      </h3>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {info.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <div className="px-6 mt-6">
        <p className="text-xs text-text-secondary text-center">

      {/* Helpful Links */}
      <div className="px-6 mt-8 mb-8">
        <h3 className="text-sm font-bold text-text-primary mb-4">📌 유용한 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 설치주소 조회 */}
          <a
            href="https://www.bworld.co.kr/myb/product/join/address/svcAveSearch.do"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl border-2 border-border p-4 hover:border-primary transition group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">📍</div>
              <div className="flex-1">
                <h4 className="font-bold text-text-primary mb-1 group-hover:text-primary transition">
                  설치주소 조회
                </h4>
                <p className="text-xs text-text-secondary mb-3">
                  우리 집 인터넷 설치 가능 여부 확인
                </p>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 px-4 rounded-lg text-sm font-bold">
                  확인하기 →
                </div>
              </div>
            </div>
          </a>

          {/* 제휴카드 할인 */}
          <a
            href="https://www.bworld.co.kr/event/page.do?menu_id=B06000000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl border-2 border-border p-4 hover:border-primary transition group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">💳</div>
              <div className="flex-1">
                <h4 className="font-bold text-text-primary mb-1 group-hover:text-primary transition">
                  제휴카드 할인
                </h4>
                <p className="text-xs text-text-secondary mb-3">
                  카드사별 추가 할인 혜택 확인
                </p>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 px-4 rounded-lg text-sm font-bold">
                  확인하기 →
                </div>
              </div>
            </div>
          </a>

          {/* BTV 채널보기 */}
          <a
            href="https://www.bworld.co.kr/content/realtime/realtime_list.do?menu_id=P03030100"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl border-2 border-border p-4 hover:border-primary transition group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">📺</div>
              <div className="flex-1">
                <h4 className="font-bold text-text-primary mb-1 group-hover:text-primary transition">
                  BTV 채널보기
                </h4>
                <p className="text-xs text-text-secondary mb-3">
                  SK BTV에서 시청 가능한 채널
                </p>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 px-4 rounded-lg text-sm font-bold">
                  확인하기 →
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
          * 선택하신 상품에 맞는 최적의 요금을 안내해드립니다
        </p>
      </div>

      {/* Sticky Bottom Button */}
      {selectedCategory && (
        <motion.div
          className="sticky-bottom"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleNext}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition"
          >
            다음
          </button>
        </motion.div>
      )}
    </div>
  );
}
