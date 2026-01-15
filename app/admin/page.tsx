'use client';
import { useRouter } from 'next/navigation';


import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/validation';
import { StatusBadge, mapOldStatus } from '@/components/admin/StatusDropdown';
import { ApplicationData } from '@/types/application';
import { motion } from 'framer-motion';
import { getApplications } from '@/lib/database';
import { getConsultations } from '@/lib/consultationDatabase';
import { ConsultationDbRecord } from '@/types/consultation';
import { useAdminAuth, logout } from '@/lib/adminAuth';
import { formatProductName } from '@/lib/productFormatter';
import { formatProductCategory } from '@/lib/productCategoryFormatter';

type CombinedRecord = {
    id: string;
    type: 'APPLICATION' | 'CONSULTATION';
    name: string;
    phone: string;
    product: string;
    monthlyPrice: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
    submittedAt: string;
};

export default function AdminPage() {
    useAdminAuth(); // Protect this page
    const router = useRouter();

    const [applications, setApplications] = React.useState<(ApplicationData & { id: string })[]>([]);
    const [consultations, setConsultations] = React.useState<ConsultationDbRecord[]>([]);
    const [filter, setFilter] = React.useState<'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED'>('ALL');
    const [isLoading, setIsLoading] = React.useState(false);

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            // Load applications
            const apps = await getApplications();
            setApplications(apps);

            // Load consultations
            const consults = await getConsultations();
            setConsultations(consults);
        } catch (error) {
            console.error('Error loading from Supabase:', error);

            // Fallback to localStorage
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('applications');
                if (stored) {
                    setApplications(JSON.parse(stored));
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadApplications();
    }, []);

    // Combine applications and consultations
    const combinedRecords: CombinedRecord[] = [
        ...applications.map(app => ({
            id: app.id,
            type: 'APPLICATION' as const,
            name: app.applicant?.name || '-',
            phone: app.applicant?.contact?.phone || '-',
            product: formatProductCategory(app.product?.category),
            monthlyPrice: app.product?.monthlyPrice ? formatCurrency(app.product.monthlyPrice) : '-',
            status: app.status || 'PENDING' as const,
            submittedAt: app.submittedAt || '',
        })),
        ...consultations.map(consult => ({
            id: consult.id,
            type: 'CONSULTATION' as const,
            name: consult.customer_name,
            phone: consult.customer_phone,
            product: '상담 신청',
            monthlyPrice: '-',
            status: consult.status === 'CONTACTED' ? 'PROCESSING' as const : consult.status as 'PENDING' | 'COMPLETED',
            submittedAt: consult.submitted_at,
        })),
    ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const filteredRecords = combinedRecords.filter((record) => {
        if (filter === 'ALL') return true;
        return record.status === filter;
    });

    const stats = {
        total: combinedRecords.length,
        pending: combinedRecords.filter((r) => r.status === 'PENDING').length,
        processing: combinedRecords.filter((r) => r.status === 'PROCESSING').length,
        completed: combinedRecords.filter((r) => r.status === 'COMPLETED').length,
    };

    const getStatusBadge = (status?: ApplicationData['status']) => {
        const labels = {
            PENDING: '접수 대기',
            PROCESSING: '처리중',
            COMPLETED: '완료',
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                    }`}
            >
                {labels[status || 'PENDING']}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-orange-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">관리자 대시보드</h1>
                            <p className="text-sm sm:text-base text-white/90 mt-1">
                                퍼펙트PC통신 X SK브로드밴드 인터넷/BTV 가입 신청 관리
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={loadApplications}
                                disabled={isLoading}
                                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-sm transition"
                            >
                                🔄 새로고침
                            </button>
                            <button
                                onClick={logout}
                                className="px-3 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg font-semibold text-sm transition"
                            >
                                🚪 로그아웃
                            </button>
                            <Link
                                href="/"
                                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-sm transition"
                            >
                                🏠 메인으로
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                        { label: '전체 신청', value: stats.total, color: 'blue' },
                        { label: '접수 대기', value: stats.pending, color: 'yellow' },
                        { label: '처리중', value: stats.processing, color: 'blue' },
                        { label: '완료', value: stats.completed, color: 'green' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl p-4 sm:p-6 border border-border shadow-sm"
                        >
                            <p className="text-xs sm:text-sm text-text-secondary mb-1 sm:mb-2">{stat.label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-text-primary">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as typeof filter)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition whitespace-nowrap ${filter === status
                                ? 'bg-primary text-white'
                                : 'bg-white text-text-secondary hover:bg-gray-100 border border-border'
                                }`}
                        >
                            {status === 'ALL' && '전체'}
                            {status === 'PENDING' && '접수 대기'}
                            {status === 'PROCESSING' && '처리중'}
                            {status === 'COMPLETED' && '완료'}
                        </button>
                    ))}
                </div>

                {/* Applications Table - Desktop Only */}
                <div className="hidden md:block bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    {filteredRecords.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-text-secondary">신청 내역이 없습니다</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                                            구분
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                                            신청자
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                                            연락처
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                                            상품
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                                            월 요금
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                                            상태
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                                            신청일시
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                                            작업
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredRecords.map((record) => (
                                        <motion.tr
                                            key={record.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    record.type === 'APPLICATION'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {record.type === 'APPLICATION' ? '가입' : '상담'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-text-primary">
                                                    {record.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-text-secondary">{record.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-text-primary">
                                                    {record.product}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-primary">
                                                    {record.monthlyPrice}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-text-secondary">
                                                    {record.submittedAt
                                                        ? new Date(record.submittedAt).toLocaleString('ko-KR')
                                                        : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.type === 'APPLICATION' ? (
                                                    <Link
                                                        href={`/admin/applications/${record.id}`}
                                                        className="text-sm font-semibold text-primary hover:text-primary-dark transition"
                                                    >
                                                        상세보기 →
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {filteredRecords.map((record) => (
                        <motion.div
                            key={record.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-5 shadow-md border border-gray-200"
                        >
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            record.type === 'APPLICATION'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {record.type === 'APPLICATION' ? '가입' : '상담'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-text-primary text-lg mb-1">{record.name}</h3>
                                    <p className="text-sm text-gray-600">{record.phone}</p>
                                </div>
                                <StatusBadge status={record.status} />
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 font-medium">상품</span>
                                    <span className="text-sm font-bold text-text-primary">{record.product}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 font-medium">월 요금</span>
                                    <span className="text-base font-bold text-primary">
                                        {record.monthlyPrice}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 font-medium">신청일</span>
                                    <span className="text-sm text-gray-800">
                                        {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : '-'}
                                    </span>
                                </div>
                            </div>

                            {record.type === 'APPLICATION' ? (
                                <button
                                    onClick={() => router.push(`/admin/applications/${record.id}`)}
                                    className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition active:scale-95"
                                >
                                    상세보기
                                </button>
                            ) : (
                                <div className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-lg text-center">
                                    상담 신청
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
