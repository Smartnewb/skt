'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getApplication, updateApplicationStatus } from '@/lib/database';
import { ApplicationData } from '@/types/application';
import { getBankName } from '@/lib/bankNames';
import { formatAccountNumber } from '@/lib/bankFormats';
import { CopyButton } from '@/components/admin/CopyButton';
import { StatusDropdown, mapOldStatus, AdminStatus, STATUS_CONFIG } from '@/components/admin/StatusDropdown';
import { TimelineMemo } from '@/components/admin/TimelineMemo';
import { RiskAlerts } from '@/components/admin/RiskBadge';
import { PRICE_TABLES } from '@/lib/productPricing';
import { formatCurrency } from '@/lib/validation';

// Mock memos for now (will be replaced with Supabase)
interface MemoEntry {
    id: string;
    adminName: string;
    content: string;
    isPinned: boolean;
    callbackTime?: string;
    logType: 'memo' | 'status_change' | 'callback' | 'system';
    createdAt: string;
}

// Generate application summary text for customer
function generateApplicationSummary(
    applicant: ApplicationData['applicant'],
    product: ApplicationData['product'],
    payment: ApplicationData['payment'],
    giftRecipient: ApplicationData['giftRecipient']
): string {
    const lines: string[] = [];

    lines.push(`1. 성명: ${applicant?.name || '-'}`);
    lines.push(`2. 주민번호: ${applicant?.birthDate || '-'}`);
    const carrier = applicant?.contact?.carrier || '';
    const phone = applicant?.contact?.phone || '-';
    const carrierPrefix = carrier ? '(' + carrier + ') ' : '';
    lines.push(`3. 연락처: ${carrierPrefix}${phone}`);
    lines.push(`4. 주소: ${applicant?.address?.basic || ''} ${applicant?.address?.detail || ''}`);

    // Payment method
    let paymentInfo = '카드결제';
    if (payment?.method === 'BANK_TRANSFER' && payment?.bankCode) {
        const bankName = getBankName(payment.bankCode);
        const accountNum = payment?.accountNumber
            ? formatAccountNumber(payment.bankCode, payment.accountNumber)
            : '';
        paymentInfo = `${bankName} ${accountNum}`;
    }
    lines.push(`5. 요금납부방법(계좌번호): ${paymentInfo}`);

    // Product
    const productParts: string[] = [];
    if (product?.category === 'INTERNET_ONLY') {
        productParts.push('인터넷 단독');
    } else if (product?.category === 'INTERNET_PHONE') {
        productParts.push('인터넷 + 집전화');
    } else if (product?.category === 'INTERNET_TV') {
        productParts.push('인터넷 + BTV');
        if (product?.tvType) productParts.push(product.tvType);
    }
    if (product?.speed) productParts.push(product.speed);
    if (product?.wifiRouter) productParts.push('WiFi 공유기');
    lines.push(`6. 신청상품: ${productParts.join(' + ')}`);

    lines.push(`7. 요금: 월 ${product?.monthlyPrice?.toLocaleString() || '-'}원`);

    // Discount type
    let discountType = '일반';
    if (product?.discountType === 'MOBILE_COMBO') {
        discountType = '휴대폰 결합';
    } else if (product?.discountType === 'FAMILY_COMBO') {
        discountType = '패밀리 결합';
    }
    lines.push(`8. ${discountType}`);

    lines.push(`9. 사은품: 신세계상품권 ${giftRecipient?.giftCardOption || '0원'}, 현금 ${product?.cashBenefit?.toLocaleString() || '0'}원`);
    lines.push(`10. 설치비: 면제`);
    lines.push(`11. 설치일정: `);

    return lines.join('\n');
}

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const applicationId = params?.id as string;

    const [application, setApplication] = React.useState<ApplicationData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [memos, setMemos] = React.useState<MemoEntry[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);

    // Calculate price breakdown (must be before early returns due to React Hooks rules)
    const WIFI_ROUTER_PRICE = 1100;
    const priceTable = React.useMemo(() => {
        if (!application?.product?.category || !application?.product?.speed) return null;
        return PRICE_TABLES.find(
            t => t.category === application.product?.category &&
                 t.speed === application.product?.speed &&
                 (application.product?.category !== 'INTERNET_TV' || t.tvType === application.product?.tvType)
        );
    }, [application?.product]);

    const generalPrice = priceTable?.prices.general || 0;
    const discountedPrice = React.useMemo(() => {
        if (!application?.product?.discountType || !priceTable) return generalPrice;
        if (application.product.discountType === 'MOBILE_COMBO') return priceTable.prices.mobileCombo;
        if (application.product.discountType === 'FAMILY_COMBO') return priceTable.prices.familyCombo;
        return generalPrice;
    }, [application?.product, priceTable, generalPrice]);

    const discountAmount = generalPrice - discountedPrice;

    React.useEffect(() => {
        if (applicationId) {
            loadApplication();
        }
    }, [applicationId]);

    const loadApplication = async () => {
        setIsLoading(true);
        try {
            const data = await getApplication(applicationId);
            setApplication(data);

            // Load memos from localStorage for now
            const storedMemos = localStorage.getItem(`memos_${applicationId}`);
            if (storedMemos) {
                setMemos(JSON.parse(storedMemos));
            }
        } catch (error) {
            console.error('Error loading application:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: AdminStatus) => {
        if (!application) return;

        setIsSaving(true);
        try {
            await updateApplicationStatus(applicationId, newStatus);
            setApplication({ ...application, status: newStatus as any });

            // Add system memo for status change
            const newMemo: MemoEntry = {
                id: Date.now().toString(),
                adminName: '시스템',
                content: `상태가 "${STATUS_CONFIG[mapOldStatus(application.status || 'PENDING')]?.label || application.status}"에서 "${STATUS_CONFIG[newStatus]?.label || newStatus}"로 변경되었습니다.`,
                isPinned: false,
                logType: 'status_change',
                createdAt: new Date().toISOString(),
            };
            const updatedMemos = [...memos, newMemo];
            setMemos(updatedMemos);
            localStorage.setItem(`memos_${applicationId}`, JSON.stringify(updatedMemos));
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddMemo = (content: string, callbackTime?: string) => {
        const newMemo: MemoEntry = {
            id: Date.now().toString(),
            adminName: '관리자',
            content,
            isPinned: false,
            callbackTime,
            logType: callbackTime ? 'callback' : 'memo',
            createdAt: new Date().toISOString(),
        };
        const updatedMemos = [...memos, newMemo];
        setMemos(updatedMemos);
        localStorage.setItem(`memos_${applicationId}`, JSON.stringify(updatedMemos));
    };

    const handlePinMemo = (id: string, isPinned: boolean) => {
        const updatedMemos = memos.map(m =>
            m.id === id ? { ...m, isPinned } : m
        );
        setMemos(updatedMemos);
        localStorage.setItem(`memos_${applicationId}`, JSON.stringify(updatedMemos));
    };

    // Risk check
    const riskCheck = React.useMemo(() => {
        if (!application) return { hasDuplicate: false, hasAccountMismatch: false };

        const applicantName = application.applicant?.name || '';
        const giftName = application.giftRecipient?.name || '';

        return {
            hasDuplicate: false, // TODO: Check from database
            hasAccountMismatch: Boolean(giftName && applicantName !== giftName),
            applicantName,
            accountHolderName: giftName,
        };
    }, [application]);

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="text-gray-500">신청 정보를 찾을 수 없습니다.</div>
            </div>
        );
    }

    const { applicant, product, payment, giftRecipient, customerRequest } = application;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← 목록으로
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {applicant?.name} 님의 신청서
                            </h1>
                            <p className="text-sm text-gray-600">
                                {application.submittedAt
                                    ? new Date(application.submittedAt).toLocaleString('ko-KR')
                                    : ''}
                            </p>
                        </div>
                    </div>
                    <StatusDropdown
                        currentStatus={mapOldStatus(application.status || 'PENDING')}
                        onChange={handleStatusChange}
                        disabled={isSaving}
                    />
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Left Panel - Customer Info & Actions */}
                <div className="space-y-6">
                    {/* Risk Alerts */}
                    <RiskAlerts result={riskCheck} />

                    {/* Customer Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg p-6 border border-gray-200"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            👤 가입자 정보
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">이름</span>
                                <CopyButton text={applicant?.name || '-'} />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">생년월일</span>
                                <CopyButton text={applicant?.birthDate || '-'} />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">연락처</span>
                                <CopyButton text={applicant?.contact?.phone || '-'} />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">통신사</span>
                                <span className="text-sm font-medium">{applicant?.contact?.carrier || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">주소</span>
                                <CopyButton
                                    text={`${applicant?.address?.basic || ''} ${applicant?.address?.detail || ''}`}
                                />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">이메일</span>
                                <span className="text-sm">{applicant?.email || '-'}</span>
                            </div>
                            {applicant?.referrerName && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">추천인</span>
                                    <CopyButton text={applicant.referrerName} />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Product Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg p-6 border border-gray-200"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            📦 상품 정보
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">상품 유형</span>
                                <span className="text-sm font-medium">
                                    {(() => {
                                        if (product?.category === 'INTERNET_ONLY') return '인터넷 단독';
                                        if (product?.category === 'INTERNET_PHONE') return '인터넷 + 전화';
                                        if (product?.category === 'INTERNET_TV') return '인터넷 + TV';
                                        return '-';
                                    })()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">인터넷 속도</span>
                                <span className="text-sm font-medium">{product?.speed || '-'}</span>
                            </div>
                            {product?.tvType && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">TV 패키지</span>
                                    <span className="text-sm font-medium">{product.tvType}</span>
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="pt-3 border-t-2 border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">정상 요금</span>
                                    <span className="text-sm font-semibold">{formatCurrency(generalPrice)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-primary font-semibold">
                                            {product?.discountType === 'MOBILE_COMBO' ? '📱 휴대폰 결합 할인' : '👨‍👩‍👧‍👦 패밀리 결합 할인'}
                                        </span>
                                        <span className="text-sm font-semibold text-primary">-{formatCurrency(discountAmount)}</span>
                                    </div>
                                )}
                                {product?.wifiRouter && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">📡 WiFi 공유기</span>
                                        <span className="text-sm font-semibold">+{formatCurrency(WIFI_ROUTER_PRICE)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-sm font-bold text-gray-900">월 최종 요금</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(product?.monthlyPrice || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-300">
                                    <span className="text-sm text-gray-600">🔧 설치비</span>
                                    <span className="text-sm font-semibold">
                                        {formatCurrency(product?.category === 'INTERNET_TV' ? 56100 : 36300)}
                                        <span className="text-xs text-gray-500 ml-1">[부가세포함]</span>
                                    </span>
                                </div>
                            </div>

                            <div className="bg-primary/10 -mx-6 px-6 py-3 mt-4 rounded-b-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-primary font-medium">사은품</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(product?.cashBenefit || 0)}
                                    </span>
                                </div>
                                <div className="text-xs text-primary/80 text-right mt-1">
                                    신세계 상품권 13만원 + 현금 {formatCurrency((product?.cashBenefit || 0) - 130000)}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg p-6 border border-gray-200"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            💳 납부 정보
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">납부 방법</span>
                                <span className="text-sm font-medium">
                                    {payment?.method === 'BANK_TRANSFER' ? '계좌이체' : '카드결제'}
                                </span>
                            </div>
                            {payment?.method === 'BANK_TRANSFER' && (
                                <>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">은행</span>
                                        <span className="text-sm font-medium">
                                            {payment?.bankCode ? getBankName(payment.bankCode) : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-600">계좌번호</span>
                                        <CopyButton
                                            text={payment?.bankCode && payment?.accountNumber
                                                ? formatAccountNumber(payment.bankCode, payment.accountNumber)
                                                : payment?.accountNumber || '-'}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Gift Recipient Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg p-6 border border-gray-200"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            🎁 사은품 수령 정보
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">수령인</span>
                                <CopyButton text={giftRecipient?.name || '-'} />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">은행</span>
                                <span className="text-sm font-medium">
                                    {giftRecipient?.bankCode ? getBankName(giftRecipient.bankCode) : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">계좌번호</span>
                                <CopyButton
                                    text={giftRecipient?.bankCode && giftRecipient?.accountNumber
                                        ? formatAccountNumber(giftRecipient.bankCode, giftRecipient.accountNumber)
                                        : giftRecipient?.accountNumber || '-'}
                                />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">상품권</span>
                                <span className="text-sm font-medium">{giftRecipient?.giftCardOption || '전액 현금'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Customer Request */}
                    {customerRequest && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-lg p-6 border border-gray-200"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                📝 고객 요청사항
                            </h2>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                                {customerRequest}
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Right Panel - Workflow & Timeline */}
                <div className="lg:sticky lg:top-6 h-fit space-y-6">
                    {/* Application Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg p-6 border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                📋 신청서 정리
                            </h2>
                            <CopyButton
                                text={generateApplicationSummary(applicant, product, payment, giftRecipient)}
                                showText={false}
                            />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {generateApplicationSummary(applicant, product, payment, giftRecipient)}
                        </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg border border-gray-200 h-[calc(100vh-450px)] min-h-[400px] flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                💬 상담 기록
                            </h2>
                            <p className="text-xs text-gray-500">메모와 콜백 예약을 관리합니다.</p>
                        </div>
                        <TimelineMemo
                            memos={memos}
                            onAddMemo={handleAddMemo}
                            onPinMemo={handlePinMemo}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
