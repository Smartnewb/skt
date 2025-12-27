'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Check credentials
        const correctUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
        const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

        if (username === correctUsername && password === correctPassword) {
            // Set authentication
            localStorage.setItem('admin_authenticated', 'true');
            router.push('/admin');
        } else {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl border border-border p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-text-primary mb-2">
                            관리자 로그인
                        </h1>
                        <p className="text-sm text-text-secondary">
                            SKT 신청 관리 시스템
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                아이디
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                placeholder="아이디를 입력하세요"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="비밀번호를 입력하세요"
                                required
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => router.push('/')}
                            className="text-sm text-text-secondary hover:text-primary transition"
                        >
                            ← 메인으로 돌아가기
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
