import { supabase } from './supabase';

export interface SiteSettings {
    id: string;
    address: string;
    phonePrimary: string;
    phoneSecondary: string | null;
    emailInfo: string;
    emailSupport: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    twitterUrl: string | null;
    tiktokUrl: string | null;
    linkedinUrl: string | null;
    aboutText: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
    id: '00000000-0000-0000-0000-000000000001',
    address: '3, Folawiyo Bankole Street, off Kilo Bus Stop, Lagos, Nigeria.',
    phonePrimary: '+44 7466 677026',
    phoneSecondary: '+44 7440 448657',
    emailInfo: 'info@alihsanrelief.ng',
    emailSupport: 'support@alihsanrelief.ng',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    twitterUrl: 'https://twitter.com',
    tiktokUrl: 'https://tiktok.com',
    linkedinUrl: 'https://linkedin.com',
    aboutText: 'Serving humanity solely for the sake of Allah. Lifting lives with compassion, dignity, and hope through sustainable support systems.',
    bankName: 'Moniepoint MFB',
    accountName: 'Al-ihsan Relief And Empowerment',
    accountNumber: '8087688959'
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', '00000000-0000-0000-0000-000000000001')
            .single();

        if (error || !data) {
            console.error('Error fetching site settings:', error);
            // Try fetching any row if the specific ID fails, since it should be a single-row table
            const { data: anyData, error: anyError } = await supabase
                .from('site_settings')
                .select('*')
                .limit(1)
                .single();

            if (anyError || !anyData) return DEFAULT_SETTINGS;
            return mapToSiteSettings(anyData);
        }

        return mapToSiteSettings(data);
    } catch (e) {
        console.error('Failed to get site settings:', e);
        return DEFAULT_SETTINGS;
    }
};

export const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<void> => {
    const updateData: any = {};
    if (settings.address !== undefined) updateData.address = settings.address;
    if (settings.phonePrimary !== undefined) updateData.phone_primary = settings.phonePrimary;
    if (settings.phoneSecondary !== undefined) updateData.phone_secondary = settings.phoneSecondary;
    if (settings.emailInfo !== undefined) updateData.email_info = settings.emailInfo;
    if (settings.emailSupport !== undefined) updateData.email_support = settings.emailSupport;
    if (settings.facebookUrl !== undefined) updateData.facebook_url = settings.facebookUrl;
    if (settings.instagramUrl !== undefined) updateData.instagram_url = settings.instagramUrl;
    if (settings.twitterUrl !== undefined) updateData.twitter_url = settings.twitterUrl;
    if (settings.tiktokUrl !== undefined) updateData.tiktok_url = settings.tiktokUrl;
    if (settings.linkedinUrl !== undefined) updateData.linkedin_url = settings.linkedinUrl;
    if (settings.aboutText !== undefined) updateData.about_text = settings.aboutText;
    if (settings.bankName !== undefined) updateData.bank_name = settings.bankName;
    if (settings.accountName !== undefined) updateData.account_name = settings.accountName;
    if (settings.accountNumber !== undefined) updateData.account_number = settings.accountNumber;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from('site_settings')
        .update(updateData)
        .eq('id', settings.id || '00000000-0000-0000-0000-000000000001');

    if (error) {
        throw new Error('Failed to update site settings: ' + error.message);
    }
};

function mapToSiteSettings(row: any): SiteSettings {
    return {
        id: row.id,
        address: row.address,
        phonePrimary: row.phone_primary,
        phoneSecondary: row.phone_secondary,
        emailInfo: row.email_info,
        emailSupport: row.email_support,
        facebookUrl: row.facebook_url,
        instagramUrl: row.instagram_url,
        twitterUrl: row.twitter_url,
        tiktokUrl: row.tiktok_url,
        linkedinUrl: row.linkedin_url,
        aboutText: row.about_text,
        bankName: row.bank_name,
        accountName: row.account_name,
        accountNumber: row.account_number,
    };
}
