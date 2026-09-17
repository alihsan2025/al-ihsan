import { supabase } from './supabase';

export type DonorTag = 'ONE_TIME' | 'FREQUENT' | 'MAJOR';

export interface DonorRecord {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    totalDonated: number;
    tag: DonorTag;
    notes: string;
    createdAt: string;
}

export interface DonorInput {
    fullName: string;
    email?: string;
    phone?: string;
    tag?: DonorTag;
    notes?: string;
}

const mapRow = (row: any): DonorRecord => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    totalDonated: Number(row.total_donated ?? 0),
    tag: row.tag ?? 'ONE_TIME',
    notes: row.notes ?? '',
    createdAt: row.created_at,
});

export const getDonors = async (): Promise<DonorRecord[]> => {
    const { data, error } = await supabase
        .from('donors')
        .select('*')
        .order('total_donated', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
};

export const createDonor = async (input: DonorInput): Promise<string> => {
    const { data, error } = await supabase.from('donors').insert({
        full_name: input.fullName,
        email: input.email || null,
        phone: input.phone || null,
        tag: input.tag || 'ONE_TIME',
        notes: input.notes || null,
    }).select('id').single();
    if (error) throw error;
    return data.id;
};

export const updateDonor = async (id: string, fields: Partial<DonorInput>): Promise<void> => {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (fields.fullName !== undefined) updateData.full_name = fields.fullName;
    if (fields.email !== undefined) updateData.email = fields.email;
    if (fields.phone !== undefined) updateData.phone = fields.phone;
    if (fields.tag !== undefined) updateData.tag = fields.tag;
    if (fields.notes !== undefined) updateData.notes = fields.notes;
    const { error } = await supabase.from('donors').update(updateData).eq('id', id);
    if (error) throw error;
};

export const getDonorDonations = async (donorId: string) => {
    const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_id', donorId)
        .order('donated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
};
