import { supabase } from './supabase';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface CampaignRecord {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    amountRaised: number;
    deadline: string | null;
    status: CampaignStatus;
    imageUrl: string;
    createdBy: string | null;
    createdAt: string;
}

export interface CampaignInput {
    title: string;
    description?: string;
    targetAmount: number;
    deadline?: string;
    status?: CampaignStatus;
    imageUrl?: string;
}

const mapRow = (row: any): CampaignRecord => ({
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    targetAmount: Number(row.target_amount ?? 0),
    amountRaised: Number(row.amount_raised ?? 0),
    deadline: row.deadline ?? null,
    status: row.status ?? 'DRAFT',
    imageUrl: row.image_url ?? '',
    createdBy: row.created_by,
    createdAt: row.created_at,
});

export const getCampaigns = async (): Promise<CampaignRecord[]> => {
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
};

export const createCampaign = async (input: CampaignInput): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('campaigns').insert({
        title: input.title,
        description: input.description || null,
        target_amount: input.targetAmount,
        deadline: input.deadline || null,
        status: input.status || 'DRAFT',
        image_url: input.imageUrl || null,
        created_by: user?.id ?? null,
    });
    if (error) throw error;
};

export const updateCampaign = async (id: string, fields: Partial<CampaignInput & { amountRaised: number }>): Promise<void> => {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (fields.title !== undefined) updateData.title = fields.title;
    if (fields.description !== undefined) updateData.description = fields.description;
    if (fields.targetAmount !== undefined) updateData.target_amount = fields.targetAmount;
    if (fields.deadline !== undefined) updateData.deadline = fields.deadline;
    if (fields.status !== undefined) updateData.status = fields.status;
    if (fields.imageUrl !== undefined) updateData.image_url = fields.imageUrl;
    if (fields.amountRaised !== undefined) updateData.amount_raised = fields.amountRaised;
    const { error } = await supabase.from('campaigns').update(updateData).eq('id', id);
    if (error) throw error;
};

export const deleteCampaign = async (id: string): Promise<void> => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
};
