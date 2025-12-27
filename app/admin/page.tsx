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
                    try {
                        const parsedApps = JSON.parse(stored);
                        setApplications(parsedApps);
                    } catch (error) {
                        console.error('Error parsing applications:', error);
                    }
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadApplications();
    }, []);

    const filteredApplications = React.useMemo(() => {
        if (filter === 'ALL') return applications;
        return applications.filter((app) => app.status === filter);
    }, [applications, filter]);

    const stats = React.useMemo(() => {
        return {
            total: applications.length,
            pending: applications.filter((a) => a.status === 'PENDING').length,
            processing: applications.filter((a) => a.status === 'PROCESSING').length,
            completed: applications.filter((a) => a.status === 'COMPLETED').length,
        };
    }, [applications]);

    const getStatusBadge = (status?: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
            COMPLETED: 'bg-green-100 text-green-800 border-green-200',
        };
        const labels: Record<string, string> = {
            PENDING: '접수 대기',
            PROCESSING: '처리중',
            COMPLETED: '완료',
        };

        return (
            <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${styles[status || 'PENDING']
                    }`}
            >
                {labels[status || 'PENDING']}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary">관리자 대시보드</h1>
                            <p className="text-sm text-text-secondary mt-1">
                                퍼펙트PC통신 X SK브로드밴드 인터넷/BTV 가입 신청 관리
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={loadApplications}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-dark transition"
                            >
                                🔄 새로고침
                            </button>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition"
                            >
                                🚪 로그아웃
                            </button>
                            <Link
                                href="/"
                                className="px-4 py-2 bg-gray-100 text-text-primary rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
                            >
                                메인으로
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                            className="bg-white rounded-xl p-6 border border-border shadow-sm"
                        >
                            <p className="text-sm text-text-secondary mb-2">{stat.label}</p>
                            <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as typeof filter)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${filter === status
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

                {/* Applications Table */}
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    {filteredApplications.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-text-secondary">신청 내역이 없습니다</p>
                        </div>
                    ) : (
                        <div className="hidden md:block overflow-x-auto">
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
                                                <div className="font-semibold text-text-primary">
                                                    {app.applicant?.name}
                                                </div>
                                                <div className="text-xs text-text-secondary">
                                                    {app.applicant?.customerType === 'PERSONAL' && '개인'}
                                                    {app.applicant?.customerType === 'INDIVIDUAL_BIZ' && '개인사업자'}
                                                    {app.applicant?.customerType === 'CORPORATE' && '법인'}
                                                    {app.applicant?.customerType === 'FOREIGNER' && '외국인'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-primary">
                                                {app.applicant?.contact.phone}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-text-primary">
                                                    {app.product?.speed}
                                                </div>
                                                <div className="text-xs text-text-secondary">
                                                    {app.product?.tvType}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                                                {app.product?.monthlyPrice
                                                    ? formatCurrency(app.product.monthlyPrice)
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                                            <td className="px-6 py-4 text-sm text-text-secondary">
                                                {app.submittedAt
                                                    ? new Date(app.submittedAt).toLocaleString('ko-KR')
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/applications/${app.id}`}
                                                    className="text-primary font-semibold text-sm hover:underline"
                                                >
                                                    상세보기
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredApplications.map((app) => (
                    <div
                        key={app.id}
                        onClick={() => router.push(`/admin/applications/${app.id}`)}
                        className="bg-white rounded-xl p-4 shadow border border-gray-200 active:bg-gray-50 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-text-primary text-base">{app.applicant?.name}</h3>
                                <p className="text-sm text-gray-600">{app.applicant?.phone}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                app.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {app.status === 'PENDING' ? '접수 대기' :
                                 app.status === 'PROCESSING' ? '처리중' : '완료'}
                            </span>
                        </div>
                        
                        <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">상품:</span>
                                <span className="font-medium text-right">{app.product?.speed}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">월 요금:</span>
                                <span className="font-medium text-primary">{app.product?.monthlyPrice ? `${app.product.monthlyPrice.toLocaleString()}원` : '-'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">신청일:</span>
                                <span className="text-gray-700">
                                    {app.submittedAt ? new Date(app.submittedAt).toLocaleString('ko-KR') : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 text-right">
                            <span className="text-xs text-primary font-medium">상세보기 →</span>
                        </div>
                    </div>
                ))}
            </div>
                </div>
            </div>
        </div>
    );
}
