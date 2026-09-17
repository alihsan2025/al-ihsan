-- ─── Content Posts System Expansions ───────────────────────────────────────────

-- Add category column
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS category text DEFAULT 'UPDATE'
  CHECK (category IN ('AWARENESS', 'APPEAL', 'UPDATE', 'APPRECIATION', 'ANNOUNCEMENT', 'ENGAGEMENT'));

-- Add media_urls array to support carousels
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT '{}';

-- Add scheduled_at
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Add metrics jsonb
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS metrics jsonb DEFAULT '{"likes": 0, "comments": 0, "shares": 0}'::jsonb;

-- Migrate existing single image_url to the new media_urls array if present
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_posts' AND column_name='image_url') THEN
    UPDATE content_posts SET media_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_url != '' AND media_urls = '{}';
  END IF;
END $$;
