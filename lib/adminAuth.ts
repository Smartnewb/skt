'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Client-side auth guard. Server-side enforcement lives in proxy.ts
 * (the Next 16 request boundary) — this hook only mirrors the redirect
 * for client-side navigations and expired sessions.
 */
export function useAdminAuth() {
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/me', { credentials: 'include' })
            .then((res) => {
                if (res.status === 401) {
                    router.push('/admin/login');
                }
            })
            .catch(() => {
                router.push('/admin/login');
            });
    }, [router]);
}

export async function logout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } finally {
        window.location.href = '/admin/login';
    }
}
