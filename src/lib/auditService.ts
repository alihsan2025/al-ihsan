import { supabase } from './supabase';

export interface AuditEntry {
    id: string;
    userId: string | null;
    userEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata: Record<string, any>;
    createdAt: string;
}

export const logAuditEvent = async (
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, any> = {}
): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('audit_log').insert({
            user_id: user?.id ?? null,
            user_email: user?.email ?? 'system',
            action,
            entity_type: entityType,
            entity_id: entityId,
            metadata,
        });
    } catch (err) {
        console.warn('Audit log failed (non-blocking):', err);
    }
};

export const getAuditLog = async (limit = 100): Promise<AuditEntry[]> => {
    const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return (data ?? []).map(row => ({
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email ?? '',
        action: row.action,
        entityType: row.entity_type ?? '',
        entityId: row.entity_id ?? '',
        metadata: row.metadata ?? {},
        createdAt: row.created_at,
    }));
};
