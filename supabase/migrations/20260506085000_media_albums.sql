-- Add additional_urls to gallery to support multiple media files per post (albums)
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS additional_urls text[] DEFAULT '{}'::text[];

-- Same for videos if multiple video uploads are needed in the future
ALTER TABLE videos ADD COLUMN IF NOT EXISTS additional_urls text[] DEFAULT '{}'::text[];
