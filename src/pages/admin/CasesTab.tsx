import React, { useEffect, useState } from 'react';
import { getCases, promoteToCase, updateCaseFields, getTimeline, addTimelineEvent, type CaseRecord, type TimelineEvent } from '../../lib/caseService';
import { getAidApplications, type AidApplicationRecord } from '../../lib/aidApplicationService';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import { formatNaira } from '../../components/admin/CurrencyDisplay';
import { ChevronLeft, Search, FolderOpen, ArrowUpRight, Clock, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const formatDate = (v: string) => new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const CasesTab: React.FC = () => {
    const [cases, setCases] = useState<CaseRecord[]>([]);
    const [pendingRequests, setPendingRequests] = useState<AidApplicationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<CaseRecord | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'CASES' | 'PENDING'>('CASES');
    const [noteText, setNoteText] = useState('');

    useEffect(() => { void load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [c, a] = await Promise.all([getCases(), getAidApplications()]);
            setCases(c);
            setPendingRequests(a.filter(app => app.status === 'APPROVED' && !c.some(cs => cs.id === app.id)));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handlePromote = async (id: string) => {
        await promoteToCase(id);
        await load();
    };

    const handleSelect = async (c: CaseRecord) => {
        setSelected(c);
        const tl = await getTimeline(c.id);
        setTimeline(tl);
    };

    const handleStatusChange = async (caseStatus: CaseRecord['caseStatus']) => {
        if (!selected) return;
        await updateCaseFields(selected.id, { caseStatus });
        await addTimelineEvent(selected.id, 'STATUS_CHANGE', `Status changed to ${caseStatus}`);
        const tl = await getTimeline(selected.id);
        setTimeline(tl);
        setCases(prev => prev.map(c => c.id === selected.id ? { ...c, caseStatus } : c));
        setSelected(prev => prev ? { ...prev, caseStatus } : null);
    };

    const handleAddNote = async () => {
        if (!selected || !noteText.trim()) return;
        const newNotes = (selected.internalNotes ? selected.internalNotes + '\n' : '') + `[${new Date().toLocaleString()}] ${noteText}`;
        await updateCaseFields(selected.id, { internalNotes: newNotes });
        await addTimelineEvent(selected.id, 'NOTE', noteText);
        setSelected(prev => prev ? { ...prev, internalNotes: newNotes } : null);
        const tl = await getTimeline(selected.id);
        setTimeline(tl);
        setNoteText('');
    };

    const filtered = cases.filter(c => c.fullName.toLowerCase().includes(search.toLowerCase()) || c.aidCategory.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading cases...</div>;

    // ── Detail View ──
    if (selected) {
        return (
            <div className="space-y-6">
                <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium">
                    <ChevronLeft size={20} /> Back to Cases
                </button>
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-white/10">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selected.fullName}</h3>
                                    <StatusBadge status={selected.caseStatus} />
                                    <StatusBadge status={selected.priority} />
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Submitted {formatDate(selected.createdAt)} · {selected.city}, {selected.state}</p>

                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">Category</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{selected.aidCategory}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">Amount Needed</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{selected.amountNeeded ? formatNaira(Number(selected.amountNeeded)) : 'N/A'}</p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                                        <p className="text-emerald-600 dark:text-emerald-400 mb-1">Amount Raised</p>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-300">{formatNaira(selected.amountRaised)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">Household</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{selected.householdSize} person{selected.householdSize > 1 ? 's' : ''}</p>
                                    </div>
                                </div>

                                {/* Story / Description */}
                                <div className="bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-transparent dark:border-white/5 text-sm">
                                    <p className="text-slate-500 dark:text-slate-400 mb-2 font-semibold">Story / Description</p>
                                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">{selected.story || selected.description}</p>
                                </div>

                                {/* Internal Notes */}
                                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30 text-sm">
                                    <p className="text-amber-800 dark:text-amber-400 font-semibold mb-2 flex items-center gap-2"><FileText size={14} /> Internal Notes</p>
                                    {selected.internalNotes ? (
                                        <p className="text-amber-900 dark:text-amber-200 whitespace-pre-line leading-relaxed">{selected.internalNotes}</p>
                                    ) : (
                                        <p className="text-amber-700/60 dark:text-amber-500/60 italic">No internal notes yet.</p>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
                                        <button onClick={handleAddNote} className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition">Add</button>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="bg-white dark:bg-[#1F2937] rounded-xl p-4 border border-slate-100 dark:border-white/10 text-sm">
                                    <p className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2"><Clock size={14} /> Case Timeline</p>
                                    {timeline.length === 0 ? (
                                        <p className="text-slate-400 italic">No timeline events.</p>
                                    ) : (
                                        <div className="space-y-3 border-l-2 border-slate-200 dark:border-white/10 pl-4 ml-1">
                                            {timeline.map(ev => (
                                                <div key={ev.id} className="relative">
                                                    <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-primary-500 border-2 border-white dark:border-[#1F2937]" />
                                                    <p className="text-slate-900 dark:text-white font-medium">{ev.eventType.replace(/_/g, ' ')}</p>
                                                    <p className="text-slate-600 dark:text-slate-400">{ev.description}</p>
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(ev.createdAt)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="xl:w-64 space-y-3 bg-slate-50 dark:bg-[#1F2937] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/10">Case Actions</h4>
                                {(['PENDING', 'APPROVED', 'FUNDRAISING', 'COMPLETED'] as const).map(s => (
                                    <button key={s} onClick={() => handleStatusChange(s)} disabled={selected.caseStatus === s}
                                        className={`w-full px-4 py-2.5 rounded-lg font-bold transition text-sm disabled:opacity-40 ${
                                            s === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200'
                                            : s === 'FUNDRAISING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-200'
                                            : s === 'APPROVED' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 hover:bg-primary-200'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200'
                                        }`}>
                                        {s}
                                    </button>
                                ))}
                                <div className="border-t border-slate-200 dark:border-white/10 pt-3 mt-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Priority</p>
                                    <div className="flex gap-2">
                                        {(['NORMAL', 'URGENT'] as const).map(p => (
                                            <button key={p} onClick={() => updateCaseFields(selected.id, { priority: p }).then(() => { setSelected(prev => prev ? { ...prev, priority: p } : null); setCases(prev => prev.map(c => c.id === selected.id ? { ...c, priority: p } : c)); })}
                                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition ${selected.priority === p ? (p === 'URGENT' ? 'bg-red-600 text-white' : 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900') : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                                                {p === 'URGENT' && <AlertTriangle size={12} className="inline mr-1" />}{p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── List View ──
    return (
        <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex gap-2">
                <button onClick={() => setView('CASES')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${view === 'CASES' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                    Active Cases ({cases.length})
                </button>
                <button onClick={() => setView('PENDING')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${view === 'PENDING' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                    Pending Requests ({pendingRequests.length})
                </button>
            </div>

            {view === 'PENDING' ? (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-white/10">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Approved Requests — Ready to Promote</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">These approved aid requests can be promoted into active cases for fundraising and tracking.</p>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {pendingRequests.length === 0 ? (
                            <EmptyState title="No pending requests" message="All approved requests have been promoted to cases." icon={CheckCircle} />
                        ) : pendingRequests.map(app => (
                            <div key={app.id} className="p-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{app.fullName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{app.aidCategory} · {app.city}, {app.state}</p>
                                </div>
                                <button onClick={() => handlePromote(app.id)} className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition flex items-center gap-2">
                                    <ArrowUpRight size={14} /> Promote to Case
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases by name or category..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-slate-900 dark:text-white placeholder:text-slate-400" />
                    </div>
                    <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {filtered.length === 0 ? (
                                <EmptyState title="No cases" message="Promote an approved aid request to create a case." icon={FolderOpen} action={{ label: 'View Pending', onClick: () => setView('PENDING') }} />
                            ) : filtered.map(c => (
                                <div key={c.id} onClick={() => handleSelect(c)} className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">{c.fullName}</h3>
                                            <StatusBadge status={c.caseStatus} />
                                            {c.priority === 'URGENT' && <StatusBadge status="URGENT" />}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.aidCategory} · {c.city}, {c.state}</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatNaira(c.amountRaised)}</p>
                                        <p className="text-[11px] text-slate-400">{formatDate(c.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CasesTab;
