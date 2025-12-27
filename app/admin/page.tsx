'use client';
import { useRouter } from 'next/navigation';


import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/validation';
import { ApplicationData } from '@/types/application';
import { motion } from 'framer-motion';
import { getApplications } from '@/lib/database';
import { useAdminAuth, logout } from '@/lib/adminAuth';

export default function AdminPage() {
    useAdminAuth(); // Protect this page
    const router = useRouter();

    const [applications, setApplications] = React.useState<(ApplicationData & { id: string })[]>([]);
    const [filter, setFilter] = React.useState<'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED'>('ALL');
    const [isLoading, setIsLoading] = React.useState(false);

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            // Try to load from Supabase first
            const apps = await getApplications();
            setApplications(apps);
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

    const filteredApplications = applications.filter((app) => {
        if (filter === 'ALL') return true;
        return app.status === filter;
    });

    const stats = {
        total: applications.length,
        pending: applications.filter((a) => a.status === 'PENDING').length,
        processing: applications.filter((a) => a.status === 'PROCESSING').length,
        completed: applications.filter((a) => a.status === 'COMPLETED').length,
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
                    {filteredApplications.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-text-secondary">신청 내역이 없습니다</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-border">
                                    <tr>
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
                                    {filteredApplications.map((app) => (
                                        <motion.tr
                                            key={app.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-text-primary">
                                                    {app.applicant?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-text-secondary">{app.applicant?.phoneNumber}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-text-primary">
                                                    {app.product?.speed}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-primary">
                                                    {app.product?.monthlyPrice
                                                        ? formatCurrency(app.product.monthlyPrice)
                                                        : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-text-secondary">
                                                    {app.submittedAt
                                                        ? new Date(app.submittedAt).toLocaleString('ko-KR')
                                                        : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/applications/${app.id}`}
                                                    className="text-sm font-semibold text-primary hover:text-primary-dark transition"
                                                >
                                                    상세보기 →
                                                </Link>
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
                    {filteredApplications.map((app) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-5 shadow-md border border-gray-200"
                        >
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                                <div className="flex-1">
                                    <h3 className="font-bold text-text-primary text-lg mb-1">{app.applicant?.name}</h3>
                                    <p className="text-sm text-gray-600">{app.applicant?.phoneNumber}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        app.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {app.status === 'PENDING' ? '접수 대기' :
                                        app.status === 'PROCESSING' ? '처리중' : '완료'}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 font-medium">상품</span>
                                    <span className="text-sm font-bold text-text-primary">{app.product?.speed}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 font-medium">월 요금</span>
                                    <span className="text-base font-bold text-primary">
                                        {app.product?.monthlyPrice ? `${app.product.monthlyPrice.toLocaleString()}원` : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600 font-medium">신청일</span>
                                    <span className="text-sm text-gray-800">
                                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : '-'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/admin/applications/${app.id}`)}
                                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition active:scale-95"
                            >
                                상세보기
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
