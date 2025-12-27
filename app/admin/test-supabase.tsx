'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function TestSupabasePage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: apps, error: err } = await supabase
                    .from('applications')
                    .select('*')
                    .limit(5);
                
                if (err) {
                    setError(err);
                } else {
                    setData(apps);
                }
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8">Error: {JSON.stringify(error)}</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
            <p className="mb-4">Found {data?.length || 0} applications</p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
