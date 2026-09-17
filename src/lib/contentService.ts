import { supabase } from './supabase';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ContentCategory = 'AWARENESS' | 'APPEAL' | 'UPDATE' | 'APPRECIATION' | 'ANNOUNCEMENT' | 'ENGAGEMENT';

export interface ContentPost {
    id: string;
    title: string;
    body: string;
    imageUrl: string;
    mediaUrls: string[];
    status: ContentStatus;
    category: ContentCategory;
    scheduledAt: string | null;
    metrics: { likes: number; comments: number; shares: number };
    publishedAt: string | null;
    authorId: string | null;
    createdAt: string;
}

export interface ContentInput {
    title: string;
    body?: string;
    imageUrl?: string;
    mediaUrls?: string[];
    status?: ContentStatus;
    category?: ContentCategory;
    scheduledAt?: string | null;
    metrics?: { likes: number; comments: number; shares: number };
}

const mapRow = (row: any): ContentPost => ({
    id: row.id,
    title: row.title,
    body: row.body ?? '',
    imageUrl: row.image_url ?? '',
    mediaUrls: row.media_urls ?? [],
    status: row.status ?? 'DRAFT',
    category: row.category ?? 'UPDATE',
    scheduledAt: row.scheduled_at,
    metrics: row.metrics ?? { likes: 0, comments: 0, shares: 0 },
    publishedAt: row.published_at,
    authorId: row.author_id,
    createdAt: row.created_at,
});

export const getContentPosts = async (): Promise<ContentPost[]> => {
    const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
};

export const createContentPost = async (input: ContentInput): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('content_posts').insert({
        title: input.title,
        body: input.body || null,
        image_url: input.imageUrl || null,
        media_urls: input.mediaUrls || [],
        status: input.status || 'DRAFT',
        category: input.category || 'UPDATE',
        scheduled_at: input.scheduledAt || null,
        metrics: input.metrics || { likes: 0, comments: 0, shares: 0 },
        published_at: input.status === 'PUBLISHED' ? new Date().toISOString() : null,
        author_id: user?.id ?? null,
    });
    if (error) throw error;
};

export const updateContentPost = async (id: string, fields: Partial<ContentInput>): Promise<void> => {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (fields.title !== undefined) updateData.title = fields.title;
    if (fields.body !== undefined) updateData.body = fields.body;
    if (fields.imageUrl !== undefined) updateData.image_url = fields.imageUrl;
    if (fields.mediaUrls !== undefined) updateData.media_urls = fields.mediaUrls;
    if (fields.category !== undefined) updateData.category = fields.category;
    if (fields.scheduledAt !== undefined) updateData.scheduled_at = fields.scheduledAt;
    if (fields.metrics !== undefined) updateData.metrics = fields.metrics;
    if (fields.status !== undefined) {
        updateData.status = fields.status;
        if (fields.status === 'PUBLISHED' && !fields.scheduledAt) updateData.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from('content_posts').update(updateData).eq('id', id);
    if (error) throw error;
};

export const deleteContentPost = async (id: string): Promise<void> => {
    const { error } = await supabase.from('content_posts').delete().eq('id', id);
    if (error) throw error;
};

export const publishPostToFacebook = async (message: string, mediaUrls: string[] = []): Promise<string> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publish-facebook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, mediaUrls }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to publish to Facebook');
    }
    return data.id as string;
};
