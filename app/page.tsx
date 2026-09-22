import { redirect } from 'next/navigation';
import { HomePageClient } from '@/components/HomePageClient';

/**
 * Public entry is the minimal consultation form. The category picker that
 * feeds the full /apply signup flow only renders when ENABLE_FULL_APPLY is
 * enabled; otherwise visitors land on /consultation.
 */
export default function HomePage() {
  if (process.env.ENABLE_FULL_APPLY !== 'true') {
    redirect('/consultation');
  }
  return <HomePageClient />;
}
