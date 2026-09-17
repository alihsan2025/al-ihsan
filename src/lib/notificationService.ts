import { supabase } from './supabase';

export interface NotificationRecord {
    id: string;
    userId: string;
    title: string;
    body: string;
    read: boolean;
    link: string;
    createdAt: string;
}

export const getNotifications = async (): Promise<NotificationRecord[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) throw error;
    return (data ?? []).map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        body: row.body ?? '',
        read: row.read ?? false,
        link: row.link ?? '',
        createdAt: row.created_at,
    }));
};

export const getUnreadCount = async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
    if (error) return 0;
    return count ?? 0;
};

export const markAsRead = async (id: string): Promise<void> => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
};

export const markAllAsRead = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
};

export const sendNotification = async (userId: string, title: string, body: string, link?: string): Promise<void> => {
    await supabase.from('notifications').insert({
        user_id: userId,
        title,
        body,
        link: link || null,
    });
};
