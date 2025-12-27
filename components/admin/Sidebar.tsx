'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
    icon: string;
    label: string;
    href: string;
    badge?: number;
}

const menuItems: MenuItem[] = [
    { icon: '📊', label: '대시보드', href: '/admin' },
    { icon: '📋', label: '신청 관리', href: '/admin/applications' },
    { icon: '📞', label: '상담 관리', href: '/admin/crm' },
    { icon: '💰', label: '정산/사은품', href: '/admin/settlement' },
    { icon: '⚙️', label: '설정', href: '/admin/settings' },
];

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname?.startsWith(href);
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 64 : 240 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-0 h-screen bg-gray-900 text-white z-40 flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h1 className="font-bold text-lg">Admin</h1>
                            <p className="text-xs text-gray-400">퍼펙트PC통신</p>
                        </motion.div>
                    )}
                    <button
                        onClick={onToggle}
                        className="p-2 hover:bg-gray-800 rounded-lg transition"
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {menuItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition ${active
                                    ? 'bg-primary text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-sm font-medium whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {item.badge && !isCollapsed && (
                                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <Link
                    href="/"
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition"
                >
                    <span>🏠</span>
                    {!isCollapsed && <span className="text-sm">메인 사이트</span>}
                </Link>
            </div>
        </motion.aside>
    );
}
