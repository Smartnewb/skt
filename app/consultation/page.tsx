'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProductSpeed,
  ProductBundle,
} from '@/types/consultation';
import {
  PRICING_TABLE,
  BUNDLE_NAMES,
  BUNDLE_DESCRIPTIONS,
  BUNDLE_BADGES,
  SPEED_NAMES,
  SPEED_DESCRIPTIONS,
  DISCOUNT_NAMES,
  formatPrice,
  formatGiftAmount,
} from '@/lib/consultationPricing';

const SPEEDS: ProductSpeed[] = ['100M', '500M', '1G'];
const BUNDLES: ProductBundle[] = [
  'INTERNET_ONLY',
  'INTERNET_BTV_ECONOMY',
  'INTERNET_BTV_STANDARD',
  'INTERNET_BTV_ALL',
];

export default function ConsultationPricingPage() {
  const router = useRouter();
  const [selectedSpeed, setSelectedSpeed] = useState<ProductSpeed>('500M');

  const handleApply = () => {
    router.push('/consultation/form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            SK브로드밴드 인터넷 + TV 상담 신청
          </h1>
        </div>

        {/* Apply Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-lg text-lg shadow-lg transition-all hover:shadow-xl"
          >
            상담 신청하기
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">월 요금 안내</h2>
          <p className="text-sm md:text-base text-gray-600">3년 약정, VAT 포함 기준</p>
        </div>

        {/* Speed Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 flex gap-1">
          {SPEEDS.map((speed) => (
            <button
              key={speed}
              onClick={() => setSelectedSpeed(speed)}
              className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm md:text-base transition-all ${
                selectedSpeed === speed
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div>{SPEED_NAMES[speed]}</div>
              <div className="text-xs font-normal mt-0.5 opacity-80">
                {SPEED_DESCRIPTIONS[speed]}
              </div>
            </button>
          ))}
        </div>

        {/* Product Cards - 2x2 Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSpeed}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            {BUNDLES.map((bundle) => {
              const pricing = PRICING_TABLE[bundle][selectedSpeed];
              const giftAmount = pricing.GENERAL.giftAmount;

              return (
                <div
                  key={bundle}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-3 md:p-5">
                    {/* Product Header */}
                    <div className="mb-3 md:mb-4">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <h3 className="text-sm md:text-base font-bold leading-tight">
                          {BUNDLE_NAMES[bundle]}
                        </h3>
                        {BUNDLE_BADGES[bundle] && (
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-semibold">
                            {BUNDLE_BADGES[bundle]}
                          </span>
                        )}
                      </div>
                      <div className="min-h-[2.5rem] md:min-h-[3rem]">
                        {BUNDLE_DESCRIPTIONS[bundle] && (
                          <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
                            {BUNDLE_DESCRIPTIONS[bundle]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Gift Badge */}
                    <div className="bg-blue-100 text-blue-700 px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-center mb-2 md:mb-3">
                      <div className="text-xs font-semibold">사은품</div>
                      <div className="text-base md:text-lg font-bold">{formatGiftAmount(giftAmount)}</div>
                    </div>

                    {/* Pricing Options */}
                    <div className="space-y-2">
                      {/* Mobile Combined - BEST */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-blue-200 rounded-lg p-2 md:p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            BEST
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-gray-700">
                            {DISCOUNT_NAMES.MOBILE}
                          </span>
                        </div>
                        <div className="text-base md:text-lg font-bold text-blue-600">
                          월 {formatPrice(pricing.MOBILE.monthlyPrice)}원
                        </div>
                      </div>

                      {/* Family & General - Side by Side */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Family Combined */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                          <div className="text-xs text-gray-600 mb-1">
                            {DISCOUNT_NAMES.FAMILY}
                          </div>
                          <div className="text-sm md:text-base font-bold text-gray-700">
                            월 {formatPrice(pricing.FAMILY.monthlyPrice)}원
                          </div>
                        </div>

                        {/* General (Regular Price) */}
                        <div className="bg-white border border-gray-200 rounded-lg p-2">
                          <div className="text-xs text-gray-500 mb-1">
                            {DISCOUNT_NAMES.GENERAL}
                          </div>
                          <div className="text-sm md:text-base font-bold text-gray-600">
                            월 {formatPrice(pricing.GENERAL.monthlyPrice)}원
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-600">
            ※ 사은품 금액은 신세계상품권 + 현금지급 합산 기준이며, 당일 지급 조건입니다.
          </p>
          <div className="pt-4">
            <a
              href="tel:010-2212-7917"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
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
              문의: 010-2212-7917
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
