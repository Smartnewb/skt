'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RiskBadgeProps {
    type: 'duplicate' | 'account_mismatch' | 'other';
    message?: string;
}

export function RiskBadge({ type, message }: RiskBadgeProps) {
    const config = {
        duplicate: {
            icon: '⚠️',
            title: '중복 신청 의심',
            description: message || '동일 연락처로 과거 신청 이력이 있습니다.',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
        },
        account_mismatch: {
            icon: '⚠️',
            title: '예금주 불일치',
            description: message || '신청자명과 예금주명이 일치하지 않습니다.',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-800',
        },
        other: {
            icon: '⚡',
            title: '확인 필요',
            description: message || '추가 확인이 필요한 사항입니다.',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-800',
        },
    };

    const { icon, title, description, bgColor, borderColor, textColor } = config[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${bgColor} ${borderColor} border rounded-lg p-3 mb-4`}
        >
            <div className="flex items-start gap-2">
                <span className="text-lg">{icon}</span>
                <div>
                    <div className={`font-semibold text-sm ${textColor}`}>{title}</div>
                    <div className={`text-xs ${textColor} opacity-80`}>{description}</div>
                </div>
            </div>
        </motion.div>
    );
}

interface RiskCheckResult {
    hasDuplicate: boolean;
    duplicateCount?: number;
    hasAccountMismatch: boolean;
    applicantName?: string;
    accountHolderName?: string;
}

export function RiskAlerts({ result }: { result: RiskCheckResult }) {
    if (!result.hasDuplicate && !result.hasAccountMismatch) {
        return null;
    }

    return (
        <div className="space-y-2">
            {result.hasDuplicate && (
                <RiskBadge
                    type="duplicate"
                    message={`동일 연락처로 ${result.duplicateCount}건의 이전 신청이 있습니다.`}
                />
            )}
            {result.hasAccountMismatch && (
                <RiskBadge
                    type="account_mismatch"
                    message={`신청자: ${result.applicantName} ≠ 예금주: ${result.accountHolderName}`}
                />
            )}
        </div>
    );
}
