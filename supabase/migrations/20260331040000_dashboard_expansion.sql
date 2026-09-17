-- =============================================================================
-- Al-Ihsan Dashboard Expansion — New Tables + aid_applications case merge
-- Paste this into the Supabase SQL Editor to run.
-- =============================================================================

-- ─── Extend admin_users with role ────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN role text NOT NULL DEFAULT 'SUPER_ADMIN'
      CHECK (role IN ('SUPER_ADMIN', 'FINANCE', 'MODERATOR', 'FIELD_AGENT'));
    ALTER TABLE admin_users ADD COLUMN full_name text;
    ALTER TABLE admin_users ADD COLUMN phone text;
  END IF;
END $$;

-- ─── Extend aid_applications with case management columns ────────────────────
DO $$
BEGIN
  -- Case promotion flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='is_case') THEN
    ALTER TABLE aid_applications ADD COLUMN is_case boolean NOT NULL DEFAULT false;
  END IF;

  -- Verification
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='verification_status') THEN
    ALTER TABLE aid_applications ADD COLUMN verification_status text DEFAULT 'PENDING'
      CHECK (verification_status IN ('PENDING','VERIFIED','REJECTED'));
  END IF;

  -- Amount tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='amount_raised') THEN
    ALTER TABLE aid_applications ADD COLUMN amount_raised numeric DEFAULT 0;
  END IF;

  -- Case status (separate from request status)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='case_status') THEN
    ALTER TABLE aid_applications ADD COLUMN case_status text DEFAULT 'PENDING'
      CHECK (case_status IN ('PENDING','APPROVED','FUNDRAISING','COMPLETED'));
  END IF;

  -- Priority
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='priority') THEN
    ALTER TABLE aid_applications ADD COLUMN priority text DEFAULT 'NORMAL'
      CHECK (priority IN ('URGENT','NORMAL'));
  END IF;

  -- Assignment
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='assigned_to') THEN
    ALTER TABLE aid_applications ADD COLUMN assigned_to uuid REFERENCES admin_users(id);
  END IF;

  -- Internal notes (admin only)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='internal_notes') THEN
    ALTER TABLE aid_applications ADD COLUMN internal_notes text;
  END IF;

  -- Documents array
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='documents') THEN
    ALTER TABLE aid_applications ADD COLUMN documents text[] DEFAULT '{}';
  END IF;

  -- Story (extended description for case view)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aid_applications' AND column_name='story') THEN
    ALTER TABLE aid_applications ADD COLUMN story text;
  END IF;
END $$;

-- ─── Case Timeline (references aid_applications) ────────────────────────────
CREATE TABLE IF NOT EXISTS case_timeline (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES aid_applications(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  description text,
  created_by  uuid REFERENCES admin_users(id),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE case_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage case_timeline"
  ON case_timeline FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ─── Donors ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL,
  email           text,
  phone           text,
  total_donated   numeric DEFAULT 0,
  tag             text DEFAULT 'ONE_TIME'
                  CHECK (tag IN ('ONE_TIME','FREQUENT','MAJOR')),
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz
);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage donors"
  ON donors FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ─── Campaigns ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  target_amount   numeric DEFAULT 0,
  amount_raised   numeric DEFAULT 0,
  deadline        date,
  status          text NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('DRAFT','ACTIVE','COMPLETED','CANCELLED')),
  image_url       text,
  created_by      uuid REFERENCES admin_users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read campaigns"
  ON campaigns FOR SELECT USING (true);

CREATE POLICY "Admins can manage campaigns"
  ON campaigns FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ─── Donations ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id        uuid REFERENCES donors(id),
  donor_name      text NOT NULL,
  amount          numeric NOT NULL CHECK (amount > 0),
  payment_method  text DEFAULT 'BANK_TRANSFER'
                  CHECK (payment_method IN ('BANK_TRANSFER','PAYSTACK','CASH','OTHER')),
  reference       text,
  case_id         uuid REFERENCES aid_applications(id),
  campaign_id     uuid REFERENCES campaigns(id),
  proof_url       text,
  verified        boolean DEFAULT false,
  notes           text,
  donated_at      timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage donations"
  ON donations FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ─── Expenses ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description     text NOT NULL,
  amount          numeric NOT NULL CHECK (amount > 0),
  category        text DEFAULT 'OPERATIONS'
                  CHECK (category IN ('BENEFICIARY_AID','OPERATIONS','LOGISTICS','STAFF','OTHER')),
  receipt_url     text,
  case_id         uuid REFERENCES aid_applications(id),
  campaign_id     uuid REFERENCES campaigns(id),
  approved_by     uuid REFERENCES admin_users(id),
  created_by      uuid REFERENCES admin_users(id),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage expenses"
  ON expenses FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ─── Content Posts ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  body            text,
  image_url       text,
  status          text NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  published_at    timestamptz,
  author_id       uuid REFERENCES admin_users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz
);

ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published content_posts"
  ON content_posts FOR SELECT
  USING (status = 'PUBLISHED' OR auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admins can manage content_posts"
  ON content_posts FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ─── Audit Log ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES admin_users(id),
  user_email  text,
  action      text NOT NULL,
  entity_type text,
  entity_id   text,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit_log"
  ON audit_log FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admins can insert audit_log"
  ON audit_log FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- ─── Notifications ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES admin_users(id),
  title       text NOT NULL,
  body        text,
  read        boolean DEFAULT false,
  link        text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'SUPER_ADMIN'
  ));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- ─── Enable Realtime ─────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
