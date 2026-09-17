-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    address text NOT NULL,
    phone_primary text NOT NULL,
    phone_secondary text,
    email_info text NOT NULL,
    email_support text,
    facebook_url text,
    instagram_url text,
    twitter_url text,
    youtube_url text,
    about_text text NOT NULL,
    bank_name text NOT NULL,
    account_name text NOT NULL,
    account_number text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view site settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin users can update site settings" ON site_settings
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Admin users can insert site settings" ON site_settings
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Insert seed data so the frontend doesn't break initially
INSERT INTO site_settings (
    id,
    address,
    phone_primary,
    phone_secondary,
    email_info,
    email_support,
    facebook_url,
    instagram_url,
    twitter_url,
    youtube_url,
    about_text,
    bank_name,
    account_name,
    account_number
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'No. 23, Iwo Road, Opposite Arisekola Mosque, Ibadan, Oyo State, Nigeria.',
    '+44 7466 677026',
    '+44 7440 448657',
    'info@alihsanrelief.ng',
    'support@alihsanrelief.ng',
    'https://facebook.com',
    'https://instagram.com',
    'https://twitter.com',
    'https://youtube.com',
    'Serving humanity solely for the sake of Allah. Lifting lives with compassion, dignity, and hope through sustainable support systems.',
    'Moniepoint MFB',
    'Al-ihsan Relief And Empowerment',
    '8087688959'
) ON CONFLICT (id) DO NOTHING;
