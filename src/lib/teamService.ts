import { supabase } from './supabase';

export type TeamRole = 'SUPER_ADMIN' | 'FINANCE' | 'MODERATOR' | 'FIELD_AGENT';

export interface TeamMember {
    id: string;
    email: string;
    fullName: string;
    role: TeamRole;
    phone: string;
    createdAt: string;
}

const mapRow = (row: any): TeamMember => ({
    id: row.id,
    email: row.email ?? '',
    fullName: row.full_name ?? row.email ?? 'Unknown',
    role: row.role ?? 'FIELD_AGENT',
    phone: row.phone ?? '',
    createdAt: row.created_at,
});

export const getTeamMembers = async (): Promise<TeamMember[]> => {
    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
};

export const updateTeamMemberRole = async (id: string, role: TeamRole): Promise<void> => {
    const { error } = await supabase
        .from('admin_users')
        .update({ role })
        .eq('id', id);
    if (error) throw error;
};

export const updateTeamMemberProfile = async (id: string, fields: { fullName?: string; phone?: string }): Promise<void> => {
    const updateData: any = {};
    if (fields.fullName !== undefined) updateData.full_name = fields.fullName;
    if (fields.phone !== undefined) updateData.phone = fields.phone;
    const { error } = await supabase.from('admin_users').update(updateData).eq('id', id);
    if (error) throw error;
};

export const deleteTeamMember = async (id: string): Promise<void> => {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) throw error;
};

export interface TeamMemberInput {
    email: string;
    fullName: string;
    phone?: string;
    role: TeamRole;
}

export const createTeamMember = async (input: TeamMemberInput): Promise<void> => {
    const { error } = await supabase.from('admin_users').insert({
        id: crypto.randomUUID(),
        email: input.email,
        full_name: input.fullName,
        phone: input.phone || '',
        role: input.role,
    });
    if (error) throw error;
};
