'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/adminAuth';

export default function SettingsPage() {
    useAdminAuth();

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
                    <div className="text-6xl mb-4">⚙️</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">설정</h1>
                    <p className="text-gray-600 mb-8">
                        Phase 2에서 구현 예정입니다.
                    </p>
                    <div className="space-y-3 text-left max-w-md mx-auto">
                        <div className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm text-gray-700">관리자 계정 관리</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm text-gray-700">상담 스크립트 관리</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm text-gray-700">금칙어 관리</span>
                        </div>
                    </div>
                    <Link
                        href="/admin/applications"
                        className="inline-block mt-8 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
                    >
                        신청 관리로 이동
                    </Link>
                </div>
            </div>
        </div>
    );
}
