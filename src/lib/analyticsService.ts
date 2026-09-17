import { supabase } from './supabase';

export interface DonationTrend {
    date: string;
    amount: number;
    count: number;
}

export interface TopDonor {
    name: string;
    total: number;
}

export interface CampaignPerformance {
    title: string;
    target: number;
    raised: number;
    percentage: number;
}

export const getDonationTrends = async (days = 30): Promise<DonationTrend[]> => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
        .from('donations')
        .select('amount, donated_at')
        .gte('donated_at', since.toISOString())
        .order('donated_at', { ascending: true });

    if (error) return [];

    const grouped: Record<string, { amount: number; count: number }> = {};
    (data ?? []).forEach(row => {
        const date = new Date(row.donated_at).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = { amount: 0, count: 0 };
        grouped[date].amount += Number(row.amount);
        grouped[date].count += 1;
    });

    return Object.entries(grouped).map(([date, v]) => ({ date, ...v }));
};

export const getTopDonors = async (limit = 10): Promise<TopDonor[]> => {
    const { data, error } = await supabase
        .from('donors')
        .select('full_name, total_donated')
        .order('total_donated', { ascending: false })
        .limit(limit);

    if (error) return [];
    return (data ?? []).map(row => ({
        name: row.full_name,
        total: Number(row.total_donated),
    }));
};

export const getCampaignPerformance = async (): Promise<CampaignPerformance[]> => {
    const { data, error } = await supabase
        .from('campaigns')
        .select('title, target_amount, amount_raised')
        .in('status', ['ACTIVE', 'COMPLETED'])
        .order('amount_raised', { ascending: false });

    if (error) return [];
    return (data ?? []).map(row => ({
        title: row.title,
        target: Number(row.target_amount),
        raised: Number(row.amount_raised),
        percentage: Number(row.target_amount) > 0
            ? Math.round((Number(row.amount_raised) / Number(row.target_amount)) * 100)
            : 0,
    }));
};

export const getCaseSuccessRate = async (): Promise<{ total: number; completed: number; rate: number }> => {
    const { data, error } = await supabase
        .from('aid_applications')
        .select('case_status')
        .eq('is_case', true);

    if (error) return { total: 0, completed: 0, rate: 0 };
    const total = (data ?? []).length;
    const completed = (data ?? []).filter(r => r.case_status === 'COMPLETED').length;
    return { total, completed, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
};

export const getOverviewStats = async () => {
    const [donations, cases, volunteers, aidApps, gallery, admins] = await Promise.all([
        supabase.from('donations').select('amount'),
        supabase.from('aid_applications').select('id, is_case, case_status').eq('is_case', true),
        supabase.from('volunteer_applications').select('*', { count: 'exact', head: true }),
        supabase.from('aid_applications').select('*', { count: 'exact', head: true }),
        supabase.from('gallery').select('*', { count: 'exact', head: true }),
        supabase.from('admin_users').select('*', { count: 'exact', head: true }),
    ]);

    const totalDonations = (donations.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
    const casesData = cases.data ?? [];
    const activeCases = casesData.filter(c => c.case_status !== 'COMPLETED').length;
    const completedCases = casesData.filter(c => c.case_status === 'COMPLETED').length;
    const pendingRequests = (aidApps.count ?? 0) - casesData.length;

    return {
        totalDonations,
        totalBeneficiaries: casesData.length,
        activeCases,
        completedCases,
        pendingRequests: Math.max(0, pendingRequests),
        volunteers: volunteers.count ?? 0,
        gallery: gallery.count ?? 0,
        admins: admins.count ?? 0,
        totalAidRequests: aidApps.count ?? 0,
    };
};
