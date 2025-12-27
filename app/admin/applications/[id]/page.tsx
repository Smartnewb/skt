'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getBankName } from '@/lib/bankNames';
import { formatCurrency } from '@/lib/validation';
import { ApplicationData } from '@/types/application';
import { motion } from 'framer-motion';
import { getApplication, updateApplicationStatus } from '@/lib/database';
import { useAdminAuth } from '@/lib/adminAuth';

function ApplicationDetailPageContent({ applicationId }: { applicationId: string }) {
    useAdminAuth();
    
    const router = useRouter();
    const [application, setApplication] = React.useState<(ApplicationData & { id: string }) | null>(null);
    const [status, setStatus] = React.useState<'PENDING' | 'PROCESSING' | 'COMPLETED'>('PENDING');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [debugInfo, setDebugInfo] = React.useState<any>(null);

    React.useEffect(() => {
        const loadApplication = async () => {
            setIsLoading(true);
            setError(null);
            console.log('Loading application with ID:', applicationId);
            
            try {
                const app = await getApplication(applicationId);
                console.log('Successfully loaded application:', app);
                setApplication(app);
                setStatus(app.status || 'PENDING');
            } catch (error: any) {
                console.error('Error loading from Supabase:', error);
                setDebugInfo({
                    error: error.message,
                    stack: error.stack,
                    id: applicationId
                });
                
                // Fallback to localStorage
                const stored = localStorage.getItem('applications');
                console.log('Trying localStorage fallback...');
                
                if (stored) {
                    const apps = JSON.parse(stored);
                    console.log('Found apps in localStorage:', apps.length);
                    const app = apps.find((a: any) => a.id === applicationId);
                    if (app) {
                        console.log('Found app in localStorage:', app);
                        setApplication(app);
                        setStatus(app.status);
                    } else {
                        console.error('App not found in localStorage with ID:', applicationId);
                        setError('신청서를 찾을 수 없습니다 (로컬에서도 없음)');
                    }
                } else {
                    console.error('No localStorage data found');
                    setError('신청서를 찾을 수 없습니다 (Supabase 및 로컬 모두 없음)');
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        loadApplication();
    }, [applicationId]);

    const handleStatusChange = async (newStatus: typeof status) => {
        setIsUpdating(true);
        try {
            const updatedApp = await updateApplicationStatus(applicationId, newStatus);
            setStatus(newStatus);
            setApplication(updatedApp);
            
            const stored = localStorage.getItem('applications');
            if (stored) {
                const apps = JSON.parse(stored);
                const updatedApps = apps.map((a: any) =>
                    a.id === applicationId ? { ...a, status: newStatus } : a
                );
                localStorage.setItem('applications', JSON.stringify(updatedApps));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('상태 업데이트 중 오류가 발생했습니다.');
        } finally {
            setIsUpdating(false);
        }
    };

    const maskSensitiveData = (data: string, visibleChars: number = 4) => {
        if (!data) return '';
        return data.slice(0, visibleChars) + '*'.repeat(Math.max(0, data.length - visibleChars));
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">신청서를 불러오는 중...</p>
                    <p className="text-xs text-text-secondary mt-2">ID: {applicationId}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !application) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-2xl">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">
                        {error || '신청서를 찾을 수 없습니다'}
                    </h2>
                    <p className="text-text-secondary mb-6">
                        신청서가 존재하지 않거나 데이터베이스 연결에 문제가 있을 수 있습니다.
                    </p>
                    
                    {debugInfo && (
                        <details className="text-left bg-gray-100 rounded-lg p-4 mb-4">
                            <summary className="cursor-pointer font-semibold">🔍 디버그 정보</summary>
                            <pre className="text-xs mt-2 overflow-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </details>
                    )}
                    
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.push('/admin')}
                            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
                        >
                            목록으로 돌아가기
                        </button>
                        <button
                            onClick={() => router.push('/admin/test-supabase')}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                        >
                            연결 테스트
                        </button>
                    </div>
                </div>
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
                    <p className="text-xs text-text-secondary mt-1">ID: {applicationId}</p>
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
                        {(['PENDING', 'PROCESSING', 'COMPLETED'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                disabled={isUpdating}
                                className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
                                    status === s
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        <InfoItem 
                            label="카테고리" 
                            value={
                                product?.category === 'INTERNET_ONLY' ? '인터넷 단독' :
                                product?.category === 'INTERNET_PHONE' ? '인터넷+집전화' :
                                product?.category === 'INTERNET_TV' ? '인터넷+BTV' : '-'
                            } 
                        />
                        <InfoItem 
                            label="할인 유형" 
                            value={
                                product?.discountType === 'MOBILE_COMBO' ? '휴대폰 결합 ⭐' :
                                product?.discountType === 'FAMILY_COMBO' ? '패밀리 결합' :
                                product?.discountType === 'GENERAL' ? '일반상품' : '-'
                            } 
                        />
                        <InfoItem label="속도" value={product?.speed} />
                        {product?.tvType && <InfoItem label="TV 타입" value={product.tvType} />}
                        <InfoItem label="월 요금" value={product?.monthlyPrice ? formatCurrency(product.monthlyPrice) : undefined} />
                        <InfoItem label="사은품" value={product?.cashBenefit ? formatCurrency(product.cashBenefit) : undefined} />
                        {product?.wifiRouter && (
                            <div className="col-span-2 bg-blue-50 rounded-lg p-3">
                                <p className="text-sm font-semibold text-blue-900">
                                    📡 WiFi 공유기 포함 (+1,100원/월)
                                </p>
                            </div>
                        )}
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
                        <InfoItem 
                            label="고객 구분" 
                            value={
                                applicant?.customerType === 'PERSONAL' ? '개인' :
                                applicant?.customerType === 'INDIVIDUAL_BIZ' ? '개인사업자' :
                                applicant?.customerType === 'CORPORATE' ? '법인' : '외국인'
                            } 
                        />
                        <InfoItem label="이름" value={applicant?.name} />
                        <InfoItem label="생년월일" value={applicant?.birthDate || ''} />
                        <InfoItem label="성별" value={applicant?.gender === 'MALE' ? '남성' : '여성'} />
                        {applicant?.businessName && (
                            <>
                                <InfoItem label="사업자명" value={applicant.businessName} />
                                <InfoItem label="사업자등록번호" value={applicant.businessRegNumber || ''} />
                            </>
                        )}
                        <InfoItem label="연락처" value={applicant?.contact.phone} />
                        <InfoItem label="이메일" value={applicant?.email} />
                        <div className="col-span-2">
                            <InfoItem label="설치 주소" value={`${applicant?.address.basic} ${applicant?.address.detail}`} />
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
                                <InfoItem label="은행" value={payment?.bankCode ? getBankName(payment.bankCode) : undefined} />
                                <InfoItem label="계좌번호" value={payment.accountNumber || ''} />
                            </>
                        )}
                        {payment?.method === 'CARD' && (
                            <>
                                <InfoItem label="카드사" value={payment.cardCompany} />
                                <InfoItem label="카드번호" value={payment.cardNumber || ''} />
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
                        <InfoItem label="계좌번호" value={giftRecipient?.accountNumber || ''} />
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

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ApplicationDetailPageContent applicationId={id} />;
}
