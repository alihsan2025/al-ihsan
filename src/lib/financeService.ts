import { supabase } from './supabase';

export type ExpenseCategory = 'BENEFICIARY_AID' | 'OPERATIONS' | 'LOGISTICS' | 'STAFF' | 'OTHER';

export interface ExpenseRecord {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    receiptUrl: string;
    caseId: string | null;
    campaignId: string | null;
    approvedBy: string | null;
    createdBy: string | null;
    createdAt: string;
}

export interface ExpenseInput {
    description: string;
    amount: number;
    category: ExpenseCategory;
    receiptUrl?: string;
    caseId?: string;
    campaignId?: string;
}

const mapRow = (row: any): ExpenseRecord => ({
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    receiptUrl: row.receipt_url ?? '',
    caseId: row.case_id,
    campaignId: row.campaign_id,
    approvedBy: row.approved_by,
    createdBy: row.created_by,
    createdAt: row.created_at,
});

export const getExpenses = async (): Promise<ExpenseRecord[]> => {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
};

export const createExpense = async (input: ExpenseInput): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('expenses').insert({
        description: input.description,
        amount: input.amount,
        category: input.category,
        receipt_url: input.receiptUrl || null,
        case_id: input.caseId || null,
        campaign_id: input.campaignId || null,
        created_by: user?.id ?? null,
    });
    if (error) throw error;
};

export const getTotalExpenses = async (): Promise<number> => {
    const { data, error } = await supabase.from('expenses').select('amount');
    if (error) return 0;
    return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
};

export const getFinancialSummary = async () => {
    const [donations, expenses] = await Promise.all([
        supabase.from('donations').select('amount, donated_at, payment_method'),
        supabase.from('expenses').select('amount, created_at, category'),
    ]);

    const totalInflow = (donations.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
    const totalOutflow = (expenses.data ?? []).reduce((s, r) => s + Number(r.amount), 0);

    const expenseByCategory = (expenses.data ?? []).reduce<Record<string, number>>((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + Number(r.amount);
        return acc;
    }, {});

    return { totalInflow, totalOutflow, balance: totalInflow - totalOutflow, expenseByCategory };
};

export const updateExpense = async (id: string, input: Partial<ExpenseInput>): Promise<void> => {
    const updateData: any = {};
    if (input.description !== undefined) updateData.description = input.description;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.category !== undefined) updateData.category = input.category;
    const { error } = await supabase.from('expenses').update(updateData).eq('id', id);
    if (error) throw error;
};

export const deleteExpense = async (id: string): Promise<void> => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
};
