# Admin Detail Page Debugging Guide

## Problem
Admin detail page shows "신청서를 찾을 수 없습니다" (Application not found)

## Diagnosis Steps

### 1. Check Supabase Connection
Visit: `http://localhost:3000/admin/test-supabase`
- This page will show if Supabase is connected
- Shows how many applications exist
- Shows the actual data structure

### 2. Check Browser Console
1. Open admin page
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for errors when clicking an application

### 3. Check Network Tab
1. F12 → Network tab
2. Click an application in admin list
3. Look for failed requests
4. Check if Supabase query is being made

### 4. Manual Supabase Check
Open `/tmp/debug_admin.html` in browser to directly query Supabase

## Common Issues

### Issue 1: No data in Supabase
**Solution:** Create a new application through the website
1. Go to main page
2. Complete full application flow
3. Check admin page again

### Issue 2: Missing columns
**Check:** Supabase dashboard → Table Editor → applications table
**Should have:** product_category, product_discount_type columns

### Issue 3: RLS (Row Level Security) blocking reads
**Check:** Supabase dashboard → Authentication → Policies
**Should have:** Policy allowing all operations OR anonymous read access

### Issue 4: Wrong Supabase credentials
**Check:** `.env.local` file has correct URL and key
**Match with:** Supabase dashboard → Project Settings → API

## Quick Fixes

### Fix 1: Add test data via Supabase SQL Editor
```sql
INSERT INTO applications (
    product_id, product_category, product_speed, product_discount_type,
    product_monthly_price, product_cash_benefit,
    applicant_name, applicant_phone, applicant_email,
    status
) VALUES (
    'test-1', 'INTERNET_TV', '500M', 'MOBILE_COMBO',
    38500, 480000,
    '홍길동', '010-1234-5678', 'test@example.com',
    'PENDING'
);
```

### Fix 2: Check RLS Policies
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'applications';

-- If no policy exists, create one
CREATE POLICY "Allow anonymous read" ON applications
  FOR SELECT
  USING (true);
```

### Fix 3: Verify table structure
```sql
-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applications';
```

## Expected Behavior
1. Admin list shows applications
2. Clicking one shows loading spinner
3. Detail page loads with all info
4. Can change status

## If Still Not Working
Run these in order and report results:
1. Visit `/admin/test-supabase` - screenshot the output
2. Browser console errors - copy exact error message
3. Network tab - screenshot failed requests
4. Supabase logs - check for query errors
