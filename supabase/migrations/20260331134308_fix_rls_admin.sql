-- Fix finite recursion on admin_users RLS
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
CREATE POLICY "Users can read own admin record"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update admin_users" ON admin_users;
CREATE POLICY "Users can update own admin record"
  ON admin_users FOR UPDATE
  USING (auth.uid() = id);

-- Insert policy already has non-recursive failover
-- Delete policy is fine restricting to own ID
DROP POLICY IF EXISTS "Admins can delete admin_users" ON admin_users;
CREATE POLICY "Users can delete own admin record"
  ON admin_users FOR DELETE
  USING (auth.uid() = id);
