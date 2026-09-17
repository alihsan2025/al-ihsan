import React, { useEffect, useState } from 'react';
import { getDonationTrends, getTopDonors, getCampaignPerformance, getCaseSuccessRate, type DonationTrend, type TopDonor, type CampaignPerformance } from '../../lib/analyticsService';
import { formatNaira } from '../../components/admin/CurrencyDisplay';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Trophy, Target, CheckCircle } from 'lucide-react';

const COLORS = ['#7a5299', '#d4af37', '#059669', '#3b82f6', '#ef4444', '#8b5cf6'];

const AnalyticsTab: React.FC = () => {
    const [trends, setTrends] = useState<DonationTrend[]>([]);
    const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
    const [campaignPerf, setCampaignPerf] = useState<CampaignPerformance[]>([]);
    const [caseRate, setCaseRate] = useState({ total: 0, completed: 0, rate: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { void load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [t, d, c, r] = await Promise.all([getDonationTrends(30), getTopDonors(10), getCampaignPerformance(), getCaseSuccessRate()]);
            setTrends(t);
            setTopDonors(d);
            setCampaignPerf(c);
            setCaseRate(r);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading analytics...</div>;

    const totalTrendAmount = trends.reduce((s, t) => s + t.amount, 0);

    return (
        <div className="space-y-6">
            {/* Summary Row */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp size={12} /> 30-Day Donations</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">{formatNaira(totalTrendAmount)}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Trophy size={12} /> Top Donor</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{topDonors[0]?.name || '—'}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Target size={12} /> Active Campaigns</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{campaignPerf.length}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle size={12} /> Case Success Rate</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{caseRate.rate}%</p>
                    <p className="text-[11px] text-slate-400">{caseRate.completed}/{caseRate.total} completed</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Donation Trends Chart */}
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Donation Trends (30 Days)</h3>
                    {trends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v: any) => [formatNaira(Number(v)), 'Amount']} labelFormatter={v => `Date: ${v}`} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                <Bar dataKey="amount" fill="#7a5299" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-sm text-slate-400 text-center py-12">No donation data for this period.</p>}
                </div>

                {/* Top Donors Leaderboard */}
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Trophy size={16} className="text-gold-500" /> Top Donors</h3>
                    {topDonors.length > 0 ? (
                        <div className="space-y-3">
                            {topDonors.map((d, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{i + 1}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</p>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatNaira(d.total)}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-slate-400 text-center py-12">No donor data available.</p>}
                </div>
            </div>

            {/* Campaign Performance */}
            {campaignPerf.length > 0 && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Campaign Performance</h3>
                    <div className="space-y-4">
                        {campaignPerf.map((c, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{c.title}</span>
                                    <span className="text-slate-500 dark:text-slate-400">{formatNaira(c.raised)} / {formatNaira(c.target)} ({c.percentage}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${c.percentage}%`, background: COLORS[i % COLORS.length] }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsTab;
