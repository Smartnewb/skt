'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/validation';
import { ApplicationData } from '@/types/application';
import { motion } from 'framer-motion';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [application, setApplication] = React.useState<
        (ApplicationData & { id: string }) | null
    >(null);
    const [status, setStatus] = React.useState<'PENDING' | 'PROCESSING' | 'COMPLETED'>('PENDING');

    React.useEffect(() => {
        // Load application from localStorage
        const stored = localStorage.getItem('applications');
        if (stored) {
            const apps = JSON.parse(stored);
            const app = apps.find((a: any) => a.id === params.id);
            if (app) {
                setApplication(app);
                setStatus(app.status);
            }
        }
    }, [params.id]);

    const handleStatusChange = (newStatus: typeof status) => {
        setStatus(newStatus);

        // Update in localStorage
        const stored = localStorage.getItem('applications');
        if (stored) {
            const apps = JSON.parse(stored);
            const updatedApps = apps.map((a: any) =>
                a.id === params.id ? { ...a, status: newStatus } : a
            );
            localStorage.setItem('applications', JSON.stringify(updatedApps));
            setApplication({ ...application!, status: newStatus });
        }
    };

    const maskSensitiveData = (data: string, visibleChars: number = 4) => {
        if (!data) return '';
        return data.slice(0, visibleChars) + '*'.repeat(Math.max(0, data.length - visibleChars));
    };

    if (!application) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-text-secondary">로딩 중...</p>
            </div>
        );
    }

    const { product, applicant, payment, giftRecipient, customerRequest } = application;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-border">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-text-secondary mb-4 hover:text-primary"
                    >
                        ← 목록으로
                    </button>
                    <h1 className="text-3xl font-bold text-text-primary">신청서 상세</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Status Control */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 border border-border"
                >
                    <h2 className="text-lg font-bold text-text-primary mb-4">상태 관리</h2>
                    <div className="flex gap-3">
                        {['PENDING', 'PROCESSING', 'COMPLETED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s as typeof status)}
                                className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${status === s
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }`}
                            >
                                {s === 'PENDING' && '접수 대기'}
                                {s === 'PROCESSING' && '처리중'}
                                {s === 'COMPLETED' && '완료'}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 border border-border"
                >
                    <h2 className="text-lg font-bold text-text-primary mb-4">선택 상품</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-text-secondary mb-1">상품</p>
                            <p className="font-semibold text-text-primary">
                                {product?.speed} + {product?.tvType}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary mb-1">월 요금</p>
                            <p className="font-semibold text-text-primary">
                                {product?.monthlyPrice ? formatCurrency(product.monthlyPrice) : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary mb-1">사은품</p>
                            <p className="font-semibold text-primary">
                                {product?.cashBenefit ? formatCurrency(product.cashBenefit) : '-'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Applicant Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 border border-border"
                >
                    <h2 className="text-lg font-bold text-text-primary mb-4">가입자 정보</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="고객 구분" value={
                            applicant?.customerType === 'PERSONAL' ? '개인' :
                                applicant?.customerType === 'INDIVIDUAL_BIZ' ? '개인사업자' :
                                    applicant?.customerType === 'CORPORATE' ? '법인' : '외국인'
                        } />
                        <InfoItem label="이름" value={applicant?.name} />
                        <InfoItem
                            label="생년월일"
                            value={maskSensitiveData(applicant?.birthDate || '', 6)}
                        />
                        <InfoItem
                            label="성별"
                            value={applicant?.gender === 'MALE' ? '남성' : '여성'}
                        />
                        {applicant?.businessName && (
                            <>
                                <InfoItem label="사업자명" value={applicant.businessName} />
                                <InfoItem
                                    label="사업자등록번호"
                                    value={maskSensitiveData(applicant.businessRegNumber || '', 5)}
                                />
                            </>
                        )}
                        <InfoItem label="연락처" value={applicant?.contact.phone} />
                        <InfoItem label="이메일" value={applicant?.email} />
                        <div className="col-span-2">
                            <InfoItem
                                label="설치 주소"
                                value={`${applicant?.address.basic} ${applicant?.address.detail}`}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Payment Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-6 border border-border"
                >
                    <h2 className="text-lg font-bold text-text-primary mb-4">납부 정보</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="납부 방식" value={payment?.method === 'BANK_TRANSFER' ? '은행 자동이체' : '카드 결제'} />
                        {payment?.method === 'BANK_TRANSFER' && (
                            <>
                                <InfoItem label="은행" value={payment.bankCode} />
                                <InfoItem
                                    label="계좌번호"
                                    value={maskSensitiveData(payment.accountNumber || '', 4)}
                                />
                            </>
                        )}
                        {payment?.method === 'CARD' && (
                            <>
                                <InfoItem label="카드사" value={payment.cardCompany} />
                                <InfoItem
                                    label="카드번호"
                                    value={maskSensitiveData(payment.cardNumber || '', 4)}
                                />
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Gift Recipient Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl p-6 border border-border"
                >
                    <h2 className="text-lg font-bold text-text-primary mb-4">사은품 수령 정보</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="수령인" value={giftRecipient?.name} />
                        <InfoItem label="은행" value={giftRecipient?.bankCode} />
                        <InfoItem
                            label="계좌번호"
                            value={maskSensitiveData(giftRecipient?.accountNumber || '', 4)}
                        />
                        <InfoItem label="상품권 옵션" value={giftRecipient?.giftCardOption} />
                    </div>
                </motion.div>

                {/* Customer Request */}
                {customerRequest && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-xl p-6 border border-border"
                    >
                        <h2 className="text-lg font-bold text-text-primary mb-4">고객 요청사항</h2>
                        <p className="text-text-primary whitespace-pre-wrap">{customerRequest}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <p className="text-sm text-text-secondary mb-1">{label}</p>
            <p className="font-semibold text-text-primary">{value || '-'}</p>
        </div>
    );
}
