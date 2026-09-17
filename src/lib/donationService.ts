import { supabase } from './supabase';

export type PaymentMethod = 'BANK_TRANSFER' | 'PAYSTACK' | 'CASH' | 'OTHER';

export interface DonationRecord {
    id: string;
    donorId: string | null;
    donorName: string;
    amount: number;
    paymentMethod: PaymentMethod;
    reference: string;
    caseId: string | null;
    campaignId: string | null;
    proofUrl: string;
    verified: boolean;
    notes: string;
    donatedAt: string;
    createdAt: string;
}

export interface DonationInput {
    donorName: string;
    donorId?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    caseId?: string;
    campaignId?: string;
    proofUrl?: string;
    verified?: boolean;
    notes?: string;
    donatedAt?: string;
}

const mapRow = (row: any): DonationRecord => ({
    id: row.id,
    donorId: row.donor_id,
    donorName: row.donor_name,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    reference: row.reference ?? '',
    caseId: row.case_id,
    campaignId: row.campaign_id,
    proofUrl: row.proof_url ?? '',
    verified: row.verified ?? false,
    notes: row.notes ?? '',
    donatedAt: row.donated_at ?? row.created_at,
    createdAt: row.created_at,
});

export const getDonations = async (): Promise<DonationRecord[]> => {
    const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('donated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
};

export const createDonation = async (input: DonationInput): Promise<void> => {
    const { error } = await supabase.from('donations').insert({
        donor_name: input.donorName,
        donor_id: input.donorId || null,
        amount: input.amount,
        payment_method: input.paymentMethod,
        reference: input.reference || null,
        case_id: input.caseId || null,
        campaign_id: input.campaignId || null,
        proof_url: input.proofUrl || null,
        verified: input.verified ?? false,
        notes: input.notes || null,
        donated_at: input.donatedAt || new Date().toISOString(),
    });
    if (error) throw error;

    // Update donor total if linked
    if (input.donorId) {
        try {
            const { error: rpcError } = await supabase.rpc('increment_donor_total', { d_id: input.donorId, d_amount: input.amount });
            if (rpcError) throw rpcError;
        } catch {
            // Fallback: manually update
            const { data } = await supabase.from('donors').select('total_donated').eq('id', input.donorId).single();
            if (data) {
                await supabase.from('donors').update({ total_donated: Number(data.total_donated) + input.amount, updated_at: new Date().toISOString() }).eq('id', input.donorId);
            }
        }
    }

    // Update campaign amount_raised if linked
    if (input.campaignId) {
        const { data: camp } = await supabase.from('campaigns').select('amount_raised').eq('id', input.campaignId).single();
        if (camp) {
            await supabase.from('campaigns').update({ amount_raised: Number(camp.amount_raised) + input.amount, updated_at: new Date().toISOString() }).eq('id', input.campaignId);
        }
    }

    // Update case amount_raised if linked
    if (input.caseId) {
        const { data: c } = await supabase.from('aid_applications').select('amount_raised').eq('id', input.caseId).single();
        if (c) {
            await supabase.from('aid_applications').update({ amount_raised: Number(c.amount_raised) + input.amount, updated_at: new Date().toISOString() }).eq('id', input.caseId);
        }
    }
};

export const verifyDonation = async (id: string, verified: boolean): Promise<void> => {
    const { error } = await supabase.from('donations').update({ verified }).eq('id', id);
    if (error) throw error;
};

export const getTotalDonations = async (): Promise<number> => {
    const { data, error } = await supabase.from('donations').select('amount');
    if (error) return 0;
    return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
};

export const updateDonation = async (id: string, input: Partial<DonationInput>): Promise<void> => {
    const updateData: any = {};
    if (input.donorName !== undefined) updateData.donor_name = input.donorName;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.paymentMethod !== undefined) updateData.payment_method = input.paymentMethod;
    if (input.reference !== undefined) updateData.reference = input.reference;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.campaignId !== undefined) updateData.campaign_id = input.campaignId || null;
    const { error } = await supabase.from('donations').update(updateData).eq('id', id);
    if (error) throw error;
};

export const deleteDonation = async (id: string): Promise<void> => {
    const { error } = await supabase.from('donations').delete().eq('id', id);
    if (error) throw error;
};
