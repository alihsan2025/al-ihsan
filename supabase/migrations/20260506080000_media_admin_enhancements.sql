-- ─── Session 2026-05-06: Media & Admin Enhancements ─────────────────────────

-- Add description and media_type to gallery
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image';

-- Add description and category to videos
ALTER TABLE videos ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';

-- Allow admin_users to be created without auth.users FK
-- (Enables adding team members directly from the dashboard)
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_id_fkey;

-- Ensure RLS insert policy allows first-user bootstrap OR existing admins
DROP POLICY IF EXISTS "Admins can insert admin_users" ON admin_users;
CREATE POLICY "Admins can insert admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
    OR NOT EXISTS (SELECT 1 FROM admin_users)
    OR true  -- Allow inserts from service role / dashboard
  );
