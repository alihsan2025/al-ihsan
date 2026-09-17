import React, { useEffect, useState } from 'react';
import { getDonors, createDonor, updateDonor, type DonorRecord, type DonorInput, type DonorTag } from '../../lib/donorService';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import { formatNaira } from '../../components/admin/CurrencyDisplay';
import FormField from '../../components/admin/FormField';
import { Search, Plus, X, UserCircle, ChevronLeft } from 'lucide-react';

const TAGS: { value: DonorTag; label: string }[] = [
    { value: 'ONE_TIME', label: 'One-Time' },
    { value: 'FREQUENT', label: 'Frequent' },
    { value: 'MAJOR', label: 'Major Donor' },
];

const DonorsTab: React.FC = () => {
    const [donors, setDonors] = useState<DonorRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState<DonorRecord | null>(null);
    const [form, setForm] = useState<DonorInput>({ fullName: '', email: '', phone: '', tag: 'ONE_TIME' });

    useEffect(() => { void load(); }, []);

    const load = async () => {
        setLoading(true);
        try { setDonors(await getDonors()); } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fullName) return;
        await createDonor(form);
        setShowForm(false);
        setForm({ fullName: '', email: '', phone: '', tag: 'ONE_TIME' });
        await load();
    };

    const handleTagUpdate = async (id: string, tag: DonorTag) => {
        await updateDonor(id, { tag });
        setDonors(prev => prev.map(d => d.id === id ? { ...d, tag } : d));
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, tag } : null);
    };

    const filtered = donors.filter(d => d.fullName.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading donors...</div>;

    if (selected) {
        return (
            <div className="space-y-6">
                <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium">
                    <ChevronLeft size={20} /> Back to Donors
                </button>
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xl">
                            {selected.fullName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selected.fullName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={selected.tag} />
                                <p className="text-sm text-slate-500 dark:text-slate-400">{selected.email || 'No email'} · {selected.phone || 'No phone'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-100 dark:border-emerald-800/30">
                            <p className="text-emerald-600 dark:text-emerald-400 text-sm mb-1">Lifetime Donated</p>
                            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatNaira(selected.totalDonated)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-5 border border-transparent dark:border-white/5">
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Tag</p>
                            <div className="flex gap-2">
                                {TAGS.map(t => (
                                    <button key={t.value} onClick={() => handleTagUpdate(selected.id, t.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selected.tag === t.value ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {selected.notes && (
                        <div className="bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-transparent dark:border-white/5 text-sm">
                            <p className="text-slate-500 dark:text-slate-400 mb-1 font-semibold">Notes</p>
                            <p className="text-slate-800 dark:text-slate-200">{selected.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search donors..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-slate-400" />
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition shadow-sm">
                    <Plus size={16} /> Add Donor
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Donor</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
                        <FormField label="Full Name" name="fullName" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
                        <FormField label="Email" name="email" type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        <FormField label="Phone" name="phone" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        <FormField label="Tag" name="tag" type="select" value={form.tag || 'ONE_TIME'} onChange={e => setForm(p => ({ ...p, tag: e.target.value as DonorTag }))} options={TAGS} />
                        <div className="sm:col-span-2 flex justify-end">
                            <button type="submit" className="px-6 py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition shadow-sm">Save Donor</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {filtered.length === 0 ? (
                        <EmptyState title="No donors" message="Add your first donor to start tracking contributions." icon={UserCircle} action={{ label: 'Add Donor', onClick: () => setShowForm(true) }} />
                    ) : filtered.map(d => (
                        <div key={d.id} onClick={() => setSelected(d)} className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">{d.fullName.charAt(0)}</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition">{d.fullName}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{d.email || d.phone || 'No contact'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={d.tag} />
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatNaira(d.totalDonated)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DonorsTab;
