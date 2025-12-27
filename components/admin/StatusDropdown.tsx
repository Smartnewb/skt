'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AdminStatus =
    | 'NEW'          // 접수대기
    | 'CONSULTING'   // 상담중
    | 'SUBMITTED'    // 접수완료
    | 'SCHEDULED'    // 설치예약
    | 'INSTALLED'    // 개통완료
    | 'PAID'         // 지급완료
    | 'CANCELLED';   // 취소

export const STATUS_CONFIG: Record<AdminStatus, { label: string; color: string; bgColor: string }> = {
    NEW: { label: '접수대기', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    CONSULTING: { label: '상담중', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    SUBMITTED: { label: '접수완료', color: 'text-indigo-800', bgColor: 'bg-indigo-100' },
    SCHEDULED: { label: '설치예약', color: 'text-purple-800', bgColor: 'bg-purple-100' },
    INSTALLED: { label: '개통완료', color: 'text-green-800', bgColor: 'bg-green-100' },
    PAID: { label: '지급완료', color: 'text-emerald-800', bgColor: 'bg-emerald-100' },
    CANCELLED: { label: '취소', color: 'text-red-800', bgColor: 'bg-red-100' },
};

// Map old status to new status
export function mapOldStatus(oldStatus: string): AdminStatus {
    const mapping: Record<string, AdminStatus> = {
        'PENDING': 'NEW',
        'PROCESSING': 'CONSULTING',
        'COMPLETED': 'INSTALLED',
    };
    return mapping[oldStatus] || (oldStatus as AdminStatus) || 'NEW';
}

interface StatusDropdownProps {
    currentStatus: AdminStatus;
    onChange: (status: AdminStatus) => void;
    disabled?: boolean;
}

export function StatusDropdown({ currentStatus, onChange, disabled }: StatusDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.NEW;

    return (
        <div className="relative">
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${config.bgColor} ${config.color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'} transition`}
            >
                <span>{config.label}</span>
                {!disabled && <span className="text-xs">▼</span>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[150px]"
                        >
                            {(Object.keys(STATUS_CONFIG) as AdminStatus[]).map((status) => {
                                const statusConfig = STATUS_CONFIG[status];
                                const isCurrentStatus = status === currentStatus;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            onChange(status);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${isCurrentStatus ? 'bg-gray-100' : ''
                                            }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${statusConfig.bgColor}`} />
                                        <span className={statusConfig.color}>{statusConfig.label}</span>
                                        {isCurrentStatus && <span className="ml-auto text-primary">✓</span>}
                                    </button>
                                );
                            })}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

interface StatusBadgeProps {
    status: AdminStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const mappedStatus = mapOldStatus(status);
    const config = STATUS_CONFIG[mappedStatus] || STATUS_CONFIG.NEW;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color}`}>
            {config.label}
        </span>
    );
}
