'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('admin_authenticated');
        if (isAuthenticated !== 'true') {
            router.push('/admin/login');
        }
    }, [router]);
}

export function logout() {
    localStorage.removeItem('admin_authenticated');
    window.location.href = '/admin/login';
}
