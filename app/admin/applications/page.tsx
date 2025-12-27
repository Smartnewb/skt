'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { motion } from 'framer-motion';
import { getApplications } from '@/lib/database';
import { ApplicationData } from '@/types/application';
import { StatusBadge, mapOldStatus } from '@/components/admin/StatusDropdown';
import { useAdminAuth } from '@/lib/adminAuth';
import { formatProductName } from '@/lib/productFormatter';

export default function ApplicationsPage() {
    useAdminAuth(); // 🔒 Security: Auth protection
    const router = useRouter();
    const [applications, setApplications] = React.useState<(ApplicationData & { id: string })[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
    const [dateFrom, setDateFrom] = React.useState('');
    const [dateTo, setDateTo] = React.useState('');

    React.useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            const apps = await getApplications();
            setApplications(apps);
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Mask phone number for list view
    const maskPhone = (phone?: string) => {
        if (!phone) return '-';
        const cleaned = phone.replace(/-/g, '');
        if (cleaned.length >= 8) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-****`;
        }
        return phone;
    };

    // Filter applications
    const filteredApplications = React.useMemo(() => {
        return applications.filter((app) => {
            // Status filter
            if (statusFilter !== 'ALL') {
                const mappedStatus = mapOldStatus(app.status || 'PENDING');
                if (mappedStatus !== statusFilter) return false;
            }

            // Search filter (name or phone)
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const name = app.applicant?.name?.toLowerCase() || '';
                const phone = app.applicant?.contact?.phone || '';
                if (!name.includes(search) && !phone.includes(search)) return false;
            }

            // Date filter
            if (dateFrom && app.submittedAt) {
                if (new Date(app.submittedAt) < new Date(dateFrom)) return false;
            }
            if (dateTo && app.submittedAt) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59);
                if (new Date(app.submittedAt) > toDate) return false;
            }

            return true;
        });
    }, [applications, statusFilter, searchTerm, dateFrom, dateTo]);

    // Stats
    const stats = {
        total: applications.length,
        new: applications.filter(a => mapOldStatus(a.status || 'PENDING') === 'NEW').length,
        consulting: applications.filter(a => mapOldStatus(a.status || 'PENDING') === 'CONSULTING').length,
        installed: applications.filter(a => mapOldStatus(a.status || 'PENDING') === 'INSTALLED').length,
    };

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">신청 관리</h1>
                <p className="text-sm text-gray-600">접수된 모든 신청서를 관리합니다.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: '전체 신청', value: stats.total, color: 'bg-blue-500' },
                    { label: '접수대기', value: stats.new, color: 'bg-yellow-500' },
                    { label: '상담중', value: stats.consulting, color: 'bg-indigo-500' },
                    { label: '개통완료', value: stats.installed, color: 'bg-green-500' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                            <span className="text-xs text-gray-600">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="이름 또는 연락처 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="ALL">전체 상태</option>
                        <option value="NEW">접수대기</option>
                        <option value="CONSULTING">상담중</option>
                        <option value="SUBMITTED">접수완료</option>
                        <option value="SCHEDULED">설치예약</option>
                        <option value="INSTALLED">개통완료</option>
                        <option value="PAID">지급완료</option>
                        <option value="CANCELLED">취소</option>
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        총 {filteredApplications.length}건
                    </span>
                    <button
                        onClick={loadApplications}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition"
                    >
                        🔄 새로고침
                    </button>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="py-12 text-center text-gray-500">로딩 중...</div>
                ) : filteredApplications.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">신청 내역이 없습니다.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">접수일시</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">상태</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">이름</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">연락처</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">상품</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">사은품</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredApplications.map((app, index) => (
                                    <motion.tr
                                        key={app.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => router.push(`/admin/applications/${app.id}`)}
                                    >
                                        <td className="px-4 py-3 text-gray-600">
                                            {app.submittedAt
                                                ? new Date(app.submittedAt).toLocaleDateString('ko-KR', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={app.status || 'PENDING'} />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {app.applicant?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {maskPhone(app.applicant?.contact?.phone)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatProductName(app.product)}
                                        </td>
                                        <td className="px-4 py-3 text-primary font-semibold">
                                            {app.product?.cashBenefit
                                                ? `${app.product.cashBenefit.toLocaleString()}원`
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/admin/applications/${app.id}`);
                                                }}
                                                className="text-primary hover:text-primary-dark font-semibold"
                                            >
                                                상세 →
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
