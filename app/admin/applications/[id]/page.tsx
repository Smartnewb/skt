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

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const applicationId = params?.id as string;

    const [application, setApplication] = React.useState<ApplicationData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [memos, setMemos] = React.useState<MemoEntry[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);

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
                                <span className="text-sm text-gray-600">주소</span>
                                <CopyButton
                                    text={`${applicant?.address?.basic || ''} ${applicant?.address?.detail || ''}`}
                                />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">이메일</span>
                                <span className="text-sm">{applicant?.email || '-'}</span>
                            </div>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-xs text-gray-600 mb-1">속도</div>
                                <div className="text-lg font-bold text-gray-900">{product?.speed || '-'}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-xs text-gray-600 mb-1">월 요금</div>
                                <div className="text-lg font-bold text-primary">
                                    {product?.monthlyPrice?.toLocaleString()}원
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-xs text-gray-600 mb-1">TV 상품</div>
                                <div className="text-lg font-bold text-gray-900">{product?.tvType || '없음'}</div>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-4">
                                <div className="text-xs text-primary mb-1">사은품</div>
                                <div className="text-lg font-bold text-primary">
                                    {product?.cashBenefit?.toLocaleString()}원
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
                <div className="lg:sticky lg:top-6 h-fit">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg border border-gray-200 h-[calc(100vh-200px)] flex flex-col"
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
