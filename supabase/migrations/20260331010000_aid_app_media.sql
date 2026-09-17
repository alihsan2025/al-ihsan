-- Add media and amount fields to aid_applications
ALTER TABLE aid_applications
  ADD COLUMN IF NOT EXISTS amount_needed text,
  ADD COLUMN IF NOT EXISTS situation_details text,
  ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url text;
