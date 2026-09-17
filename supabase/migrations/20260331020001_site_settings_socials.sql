-- Update social links columns
ALTER TABLE site_settings
  DROP COLUMN IF EXISTS youtube_url,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;
