'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApplicationStore } from '@/store/useApplicationStore';
import { PRODUCTS } from '@/lib/mockData';
import { formatCurrency } from '@/lib/validation';
import { ProductInfo } from '@/types/application';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = React.useState<ProductInfo | null>(null);
  const [wifiRouter, setWifiRouter] = React.useState(false);
  const setProduct = useApplicationStore((state) => state.setProduct);
  const setCurrentStep = useApplicationStore((state) => state.setCurrentStep);

  const WIFI_ROUTER_PRICE = 1100;

  const handleNext = () => {
    if (selectedProduct) {
      const productWithWifi = {
        ...selectedProduct,
        wifiRouter,
        monthlyPrice: selectedProduct.monthlyPrice + (wifiRouter ? WIFI_ROUTER_PRICE : 0),
      };
      setProduct(productWithWifi);
      setCurrentStep(1);
      router.push('/apply/customer-info');
    }
  };

  const totalPrice = selectedProduct
    ? selectedProduct.monthlyPrice + (wifiRouter ? WIFI_ROUTER_PRICE : 0)
    : 0;

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
            SKT 인터넷 + TV 신청
          </h1>
          <p className="text-lg text-text-secondary">
            사은품, 최대 <span className="text-primary font-bold">48만 원</span> 바로 드려요.
          </p>
        </motion.div>
      </div>

      {/* Question */}
      <div className="px-6 mb-6">
        <motion.h2
          className="label-conversational"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          어떤 속도를 원하시나요?
        </motion.h2>
      </div>

      {/* Product Cards */}
      <div className="px-6 space-y-4">
        {PRODUCTS.map((product, index) => (
          <Card
            key={product.id}
            selected={selectedProduct?.id === product.id}
            onClick={() => setSelectedProduct(product)}
            badge={product.isBest ? '🔥 가장 많이 선택해요' : undefined}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">
                  {product.speed}
                </h3>
                <p className="text-sm text-text-secondary">{product.tvType}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-secondary mb-1">월</div>
                <div className="text-xl font-bold text-text-primary">
                  {formatCurrency(product.monthlyPrice)}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">
                  현금 사은품
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(product.cashBenefit)}
                </span>
              </div>
            </div>

            <p className="text-sm text-text-secondary mt-3">
              {product.description}
            </p>
          </Card>
        ))}
      </div>

      {/* WiFi Router Option */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 mt-6"
        >
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="wifi-router"
                  checked={wifiRouter}
                  onChange={(e) => setWifiRouter(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="wifi-router" className="cursor-pointer">
                  <div className="font-semibold text-text-primary">
                    📡 WiFi 공유기 포함
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    월 {formatCurrency(WIFI_ROUTER_PRICE)} 추가
                  </div>
                </label>
              </div>
              {wifiRouter && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-primary font-bold"
                >
                  +{formatCurrency(WIFI_ROUTER_PRICE)}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer Note */}
      <div className="px-6 mt-6">
        <p className="text-xs text-text-secondary text-center">
          * 위 요금은 '요즘가족결합' 기준이며, 3년 약정 시 금액이에요.
        </p>
      </div>

      {/* Sticky Bottom Button */}
      {selectedProduct && (
        <motion.div
          className="sticky-bottom"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button onClick={handleNext}>
            다음 ({formatCurrency(totalPrice)})
          </Button>
        </motion.div>
      )}
    </div>
  );
}
