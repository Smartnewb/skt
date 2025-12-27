'use client';

import React from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useAdminAuth } from '@/lib/adminAuth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useAdminAuth();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
            />
            <main
                className="transition-all duration-200"
                style={{ marginLeft: isCollapsed ? 64 : 240 }}
            >
                {children}
            </main>
        </div>
    );
}
