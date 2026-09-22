import { redirect } from 'next/navigation';

/**
 * The full signup flow collects account/card/birthdate PII and stays gated
 * behind ENABLE_FULL_APPLY (default off) until Phase-1 hardening lands.
 * When disabled, every /apply/* page redirects to the minimal consultation
 * form — the only public entry point.
 */
export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  if (process.env.ENABLE_FULL_APPLY !== 'true') {
    redirect('/consultation');
  }
  return <>{children}</>;
}
