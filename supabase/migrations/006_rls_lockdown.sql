-- ============================================================================
-- Phase-0 Security Remediation: RLS lockdown
-- ----------------------------------------------------------------------------
-- OPERATOR: apply this file in the Supabase SQL Editor. Do NOT run it from the
-- app. After this migration:
--   * applications, consultation_logs, status_history: RLS on, ALL privileges
--     revoked from anon + authenticated (service_role / server only).
--   * consultations: RLS on, SELECT/UPDATE/DELETE revoked. The public form
--     keeps ONE insert path: column-scoped GRANT INSERT to anon + an
--     insert-only RLS policy. All other access is service-role only.
--   * New minimal-payload columns on consultations (interested_product,
--     region, preferred_time, consent_version, consented_at).
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. New columns for the minimal consultation payload (safe to re-run).
-- ---------------------------------------------------------------------------
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS interested_product TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS region TEXT;             -- 시/군/구 level only
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS preferred_time TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS consent_version TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- 2. Enable RLS on every PII-bearing table (idempotent).
-- ---------------------------------------------------------------------------
ALTER TABLE applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. Drop EVERY existing policy on these tables (covers the known permissive
--    "USING (true)" policies and any others created out-of-band), then
--    recreate only what the public form needs.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
    p RECORD;
BEGIN
    FOREACH t IN ARRAY ARRAY['applications', 'consultation_logs', 'status_history', 'consultations']
    LOOP
        FOR p IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
        END LOOP;
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Revoke all table privileges from the public-facing roles.
--    (service_role is a separate Supabase role and is unaffected — server
--    code uses it via SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.)
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.applications      FROM anon, authenticated;
REVOKE ALL ON public.consultation_logs FROM anon, authenticated;
REVOKE ALL ON public.status_history    FROM anon, authenticated;
REVOKE ALL ON public.consultations     FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Public form insert path on consultations ONLY:
--    a) column-scoped GRANT — anon may supply values for these columns only.
--       All other columns (id, status, timestamps) take their DEFAULTs and
--       cannot be set by anon at all.
--    b) insert-only RLS policy — no SELECT/UPDATE/DELETE policy exists, so
--       anon can never read or modify rows.
-- ---------------------------------------------------------------------------
GRANT INSERT (
    customer_name,
    customer_phone,
    interested_product,
    region,
    preferred_time,
    privacy_consent,
    consent_version,
    consented_at
) ON public.consultations TO anon;

CREATE POLICY "anon_insert_consultations" ON public.consultations
    FOR INSERT
    TO anon
    WITH CHECK (status = 'PENDING');

-- ---------------------------------------------------------------------------
-- 6. Products / reference tables:
--    This project has no product/reference tables in the database — pricing
--    data lives in application code (lib/consultationPricing.ts,
--    lib/productPricing.ts). If such a table is added later, keep
--    `GRANT SELECT ... TO anon` only when it contains no PII and a public
--    page needs it.
-- ---------------------------------------------------------------------------

COMMIT;

-- ============================================================================
-- VERIFICATION (run after applying — expected results in comments)
-- ============================================================================
--
-- Remaining policies per table — expect only "anon_insert_consultations"
-- on consultations and NOTHING on the others:
--
--   SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'public'
--     AND tablename IN ('applications', 'consultation_logs', 'status_history', 'consultations')
--   ORDER BY tablename, policyname;
--
-- Table grants per role — expect: anon/authenticated have ONLY
-- INSERT(customer_name, customer_phone, interested_product, region,
-- preferred_time, privacy_consent, consent_version, consented_at)
-- on consultations and nothing else:
--
--   SELECT grantee, table_name, privilege_type, column_name
--   FROM information_schema.column_privileges
--   WHERE table_schema = 'public'
--     AND grantee IN ('anon', 'authenticated')
--     AND table_name IN ('applications', 'consultation_logs', 'status_history', 'consultations')
--   ORDER BY grantee, table_name, column_name;
--
--   SELECT grantee, table_name, privilege_type
--   FROM information_schema.table_privileges
--   WHERE table_schema = 'public'
--     AND grantee IN ('anon', 'authenticated')
--     AND table_name IN ('applications', 'consultation_logs', 'status_history', 'consultations')
--   ORDER BY grantee, table_name;
--
-- Functional checks (as anon via REST): INSERT on consultations should work,
-- SELECT on consultations/applications should return permission denied.
-- ============================================================================
