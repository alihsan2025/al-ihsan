import React, { useState, useEffect } from 'react';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import {
    LogOut, LayoutDashboard, Image as ImageIcon,
    Users, HandHeart, Settings, ShieldCheck,
    ChevronRight, Sun, Moon, Menu, X, Activity, ArrowUpRight,
    Banknote, Target, Wallet, Bell,
    Shield, ScrollText, TrendingUp
} from 'lucide-react';
import VolunteerApplicationsList from './VolunteerApplicationsList';
import AidApplicationsList from './AidApplicationsList';
import SiteSettingsTab from './SiteSettingsTab';
import CasesTab from './CasesTab';
import DonationsTab from './DonationsTab';
import CampaignsTab from './CampaignsTab';
import FinanceTab from './FinanceTab';
import TeamTab from './TeamTab';
import MediaHubTab from './MediaHubTab';
import NotificationsTab from './NotificationsTab';
import StatCard from '../../components/admin/StatCard';
import { formatNaira } from '../../components/admin/CurrencyDisplay';
import { supabase } from '../../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getOverviewStats } from '../../lib/analyticsService';
import { getUnreadCount } from '../../lib/notificationService';
import { getAuditLog, type AuditEntry } from '../../lib/auditService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type TabKey = 'OVERVIEW' | 'CASES' | 'AID_REQUESTS' | 'DONATIONS' | 'CAMPAIGNS' | 'FINANCE' | 'GALLERY' | 'VOLUNTEERS' | 'TEAM' | 'NOTIFICATIONS' | 'SITE_SETTINGS' | 'AUDIT_LOG';

interface TabMeta { label: string; title: string; icon: React.ElementType; group: string }

const TAB_META: Record<TabKey, TabMeta> = {
    OVERVIEW:      { label: 'Dashboard',       title: 'Platform Overview',          icon: LayoutDashboard, group: 'Overview' },
    CASES:         { label: 'Cases',            title: 'Case Management',           icon: HandHeart,       group: 'Operations' },
    AID_REQUESTS:  { label: 'Aid Requests',     title: 'Request for Help',          icon: ScrollText,      group: 'Operations' },
    DONATIONS:     { label: 'Donations',        title: 'Donation Records',          icon: Banknote,        group: 'Finance' },
    CAMPAIGNS:     { label: 'Campaigns',        title: 'Campaigns & Projects',      icon: Target,          group: 'Finance' },
    FINANCE:       { label: 'Finance',          title: 'Financial Management',      icon: Wallet,          group: 'Finance' },
    GALLERY:       { label: 'Media Hub',        title: 'Media Hub',                 icon: ImageIcon,       group: 'Content' },
    VOLUNTEERS:    { label: 'Volunteers',       title: 'Volunteer Register',        icon: Users,           group: 'People' },
    TEAM:          { label: 'Team',             title: 'Team & Roles',              icon: Shield,          group: 'People' },
    NOTIFICATIONS: { label: 'Notifications',    title: 'Notifications',             icon: Bell,            group: 'System' },
    SITE_SETTINGS: { label: 'Site Settings',    title: 'System Configuration',      icon: Settings,        group: 'System' },
    AUDIT_LOG:     { label: 'Audit Log',        title: 'Audit Trail',               icon: ScrollText,      group: 'System' },
};

const GROUPS = ['Overview', 'Operations', 'Finance', 'Content', 'People', 'System'];

const Dashboard: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { allowedTabs, canAccess } = useRoleAccess();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlTab = searchParams.get('tab') as TabKey | null;
    const activeTab: TabKey = urlTab && TAB_META[urlTab] && allowedTabs.includes(urlTab) ? urlTab : 'OVERVIEW';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const navigate = useNavigate();

    // Overview state
    const [stats, setStats] = useState({ totalDonations: 0, totalBeneficiaries: 0, activeCases: 0, completedCases: 0, pendingRequests: 0, volunteers: 0, gallery: 0, admins: 0, totalAidRequests: 0 });
    const [recentActivity, setRecentActivity] = useState<AuditEntry[]>([]);
    const [donationChart, setDonationChart] = useState<{ date: string; amount: number }[]>([]);

    useEffect(() => {
        getUnreadCount().then(setUnreadNotifs).catch(() => {});
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'OVERVIEW') return;
        const loadOverview = async () => {
            try {
                const [s, audit] = await Promise.all([getOverviewStats(), getAuditLog(10)]);
                setStats(s);
                setRecentActivity(audit);

                // Build 7-day chart from donations
                const { data } = await supabase.from('donations').select('amount, donated_at').gte('donated_at', new Date(Date.now() - 7 * 86400000).toISOString()).order('donated_at');
                const grouped: Record<string, number> = {};
                (data ?? []).forEach(r => {
                    const d = new Date(r.donated_at).toLocaleDateString('en-GB', { weekday: 'short' });
                    grouped[d] = (grouped[d] || 0) + Number(r.amount);
                });
                setDonationChart(Object.entries(grouped).map(([date, amount]) => ({ date, amount })));
            } catch (e) { console.error(e); }
        };
        loadOverview();
    }, [activeTab]);



    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/admin', { replace: true });
    };

    const switchTab = (tab: TabKey) => {
        if (!canAccess(tab)) return;
        setSearchParams({ tab });
        setMobileMenuOpen(false);
    };

    const NavItem = ({ tab }: { tab: TabKey }) => {
        const { label, icon: Icon } = TAB_META[tab];
        const isActive = activeTab === tab;
        const isNotifTab = tab === 'NOTIFICATIONS';
        return (
            <button onClick={() => switchTab(tab)}
                className={`group flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}>
                <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                    {label}
                </div>
                <div className="flex items-center gap-1.5">
                    {isNotifTab && unreadNotifs > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                    )}
                    {isActive && <ChevronRight size={14} className="opacity-50" />}
                </div>
            </button>
        );
    };

    const currentMeta = TAB_META[activeTab];

    // Group tabs by their group, filtered by role access
    const groupedTabs = GROUPS.map(group => ({
        group,
        tabs: (Object.keys(TAB_META) as TabKey[]).filter(t => TAB_META[t].group === group && canAccess(t)),
    })).filter(g => g.tabs.length > 0);

    // Mobile bottom bar: show first 5 accessible tabs
    const mobileBarTabs = allowedTabs.slice(0, 5) as TabKey[];

    return (
        <div className="admin-dashboard flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans selection:bg-primary-500/30 overflow-hidden">

            {/* ── Desktop Sidebar ─────────────────────────────────────── */}
            <aside className="hidden md:flex w-60 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-white/10 flex-col justify-between shrink-0 h-screen">
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-white/5">
                        <img src="/logo.jpeg" className="w-8 h-8 rounded-md object-cover ring-1 ring-slate-200 dark:ring-white/10" alt="Logo" />
                        <div>
                            <span className="block font-bold text-sm tracking-tight">Al-Ihsan</span>
                            <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">Command Center</span>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                        {groupedTabs.map(({ group, tabs }) => (
                            <div key={group}>
                                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-2">{group}</div>
                                <div className="space-y-0.5">
                                    {tabs.map(tab => <NavItem key={tab} tab={tab} />)}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-1">
                    <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        {theme === 'dark' ? <><Sun size={16} /> Light</> : <><Moon size={16} /> Dark</>}
                    </button>
                    <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-400/10 rounded-lg transition-colors">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Mobile Header ───────────────────────────────────────── */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-white/10 h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <img src="/logo.jpeg" className="w-7 h-7 rounded-md object-cover" alt="" />
                    <span className="font-bold text-sm tracking-tight">Al-Ihsan</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => switchTab('NOTIFICATIONS')} className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors">
                        <Bell size={18} />
                        {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                    </button>
                    <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors">
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors">
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            {/* ── Mobile Slide-out Menu ────────────────────────────────── */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute top-14 right-0 w-64 bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-white/10 h-[calc(100vh-3.5rem)] shadow-2xl p-4 space-y-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {groupedTabs.map(({ group, tabs }) => (
                            <div key={group}>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">{group}</div>
                                <div className="space-y-0.5">{tabs.map(tab => <NavItem key={tab} tab={tab} />)}</div>
                            </div>
                        ))}
                        <div className="border-t border-slate-200 dark:border-white/10 pt-3">
                            <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-400/10 rounded-lg transition-colors">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Content Area ───────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto mt-14 md:mt-0 pb-20 md:pb-0 relative">
                <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">

                    {/* Top Header Bar */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{currentMeta.title}</h1>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            {unreadNotifs > 0 && (
                                <button onClick={() => switchTab('NOTIFICATIONS')} className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors">
                                    <Bell size={18} />
                                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                            )}
                            <span className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                            </span>
                        </div>
                    </header>

                    {/* Tab Content */}
                    <div className="w-full">

                        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
                        {activeTab === 'OVERVIEW' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <StatCard label="Total Donations" value={formatNaira(stats.totalDonations)} icon={Banknote} accent="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" onClick={() => switchTab('DONATIONS')} />
                                    <StatCard label="Beneficiaries" value={stats.totalBeneficiaries} icon={HandHeart} accent="text-primary-600 dark:text-primary-400" bg="bg-primary-50 dark:bg-primary-900/20" onClick={() => switchTab('CASES')} />
                                    <StatCard label="Active Cases" value={stats.activeCases} icon={Activity} accent="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" onClick={() => switchTab('CASES')} />
                                    <StatCard label="Completed" value={stats.completedCases} icon={ShieldCheck} accent="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                                    <StatCard label="Pending Requests" value={stats.pendingRequests} icon={ScrollText} accent="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/20" onClick={() => switchTab('AID_REQUESTS')} />
                                </div>

                                <div className="grid lg:grid-cols-3 gap-6">
                                    {/* Donation Chart */}
                                    <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <TrendingUp size={16} className="text-slate-400" /> Weekly Donations
                                        </h2>
                                        {donationChart.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart data={donationChart}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                                                    <Tooltip formatter={(v: any) => [formatNaira(Number(v)), 'Amount']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                                    <Bar dataKey="amount" fill="#7a5299" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No donation data this week</div>
                                        )}
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6 flex flex-col">
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Activity size={16} className="text-slate-400" /> Recent Activity
                                        </h2>
                                        <div className="space-y-3 flex-1 overflow-y-auto">
                                            {recentActivity.length === 0 ? (
                                                <p className="text-sm text-slate-400 text-center py-8">No recent activity.</p>
                                            ) : recentActivity.map(a => (
                                                <div key={a.id} className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">{a.userEmail.split('@')[0]}</span> {a.action.toLowerCase()}</p>
                                                        <p className="text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {([
                                        { label: 'View Cases', tab: 'CASES' as TabKey, icon: HandHeart, count: stats.activeCases },
                                        { label: 'Donations', tab: 'DONATIONS' as TabKey, icon: Banknote, count: undefined },
                                        { label: 'Volunteers', tab: 'VOLUNTEERS' as TabKey, icon: Users, count: stats.volunteers },
                                        { label: 'Finance', tab: 'FINANCE' as TabKey, icon: Wallet, count: undefined },
                                    ].filter(a => canAccess(a.tab))).map((action, i) => (
                                        <button key={i} onClick={() => switchTab(action.tab)}
                                            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-left hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <action.icon size={18} className="text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                                <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors" />
                                            </div>
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{action.label}</p>
                                            {action.count !== undefined && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{action.count} records</p>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══════════════ MEDIA HUB TAB ═══════════════ */}
                        {activeTab === 'GALLERY' && <MediaHubTab />}

                        {/* ═══════════════ AUDIT LOG TAB ═══════════════ */}
                        {activeTab === 'AUDIT_LOG' && <AuditLogView />}

                        {/* ═══════════════ DATA TABS ═══════════════ */}
                        {activeTab === 'CASES' && <CasesTab />}
                        {activeTab === 'AID_REQUESTS' && <AidApplicationsList />}
                        {activeTab === 'DONATIONS' && <DonationsTab />}
                        {activeTab === 'CAMPAIGNS' && <CampaignsTab />}
                        {activeTab === 'FINANCE' && <FinanceTab />}
                        {activeTab === 'VOLUNTEERS' && <VolunteerApplicationsList />}
                        {activeTab === 'TEAM' && <TeamTab />}
                        {activeTab === 'NOTIFICATIONS' && <NotificationsTab />}
                        {activeTab === 'SITE_SETTINGS' && <SiteSettingsTab />}
                    </div>
                </div>
            </main>

            {/* ── Mobile Bottom Tab Bar ────────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-1 py-1.5">
                {mobileBarTabs.map(tab => {
                    const { icon: Icon, label } = TAB_META[tab];
                    const isActive = activeTab === tab;
                    return (
                        <button key={tab} onClick={() => switchTab(tab)}
                            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 flex-1 relative ${
                                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                            <Icon size={18} />
                            {tab === 'NOTIFICATIONS' && unreadNotifs > 0 && <span className="absolute top-0.5 right-1/4 w-2 h-2 bg-red-500 rounded-full" />}
                            <span className="text-[9px] font-medium truncate w-full text-center leading-tight">{label.length > 8 ? label.slice(0, 7) + '…' : label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

// ── Inline Audit Log View ──────────────────────────────────────────────────
const AuditLogView: React.FC = () => {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAuditLog(100).then(setEntries).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading audit log...</div>;

    return (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Trail</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete history of admin actions.</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
                {entries.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">No audit entries.</div>
                ) : entries.map(e => (
                    <div key={e.id} className="p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0">
                            {e.userEmail?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">{e.userEmail}</span> <span className="text-slate-500">{e.action}</span></p>
                            {e.entityType && <p className="text-xs text-slate-400 mt-0.5">{e.entityType} · {e.entityId?.slice(0, 8)}</p>}
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(e.createdAt).toLocaleString('en-GB')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
