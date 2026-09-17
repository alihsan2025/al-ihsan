import React, { useEffect, useState } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense, getFinancialSummary, type ExpenseRecord, type ExpenseInput, type ExpenseCategory } from '../../lib/financeService';
import EmptyState from '../../components/admin/EmptyState';
import { formatNaira } from '../../components/admin/CurrencyDisplay';
import FormField from '../../components/admin/FormField';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionModal, { type ActionModalState } from '../../components/admin/ActionModal';
import { Plus, X, Download, TrendingUp, TrendingDown, Wallet, Trash2, Pencil } from 'lucide-react';

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
    { value: 'BENEFICIARY_AID', label: 'Beneficiary Aid' }, { value: 'OPERATIONS', label: 'Operations' },
    { value: 'LOGISTICS', label: 'Logistics' }, { value: 'STAFF', label: 'Staff' }, { value: 'OTHER', label: 'Other' },
];
const formatDate = (v: string) => new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const FinanceTab: React.FC = () => {
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [summary, setSummary] = useState({ totalInflow: 0, totalOutflow: 0, balance: 0, expenseByCategory: {} as Record<string, number> });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ExpenseInput>({ description: '', amount: 0, category: 'OPERATIONS' });
    const [modalState, setModalState] = useState<ActionModalState>('HIDDEN');
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', isDanger: false, confirmText: 'Confirm', successMessage: '' });
    const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

    useEffect(() => { void load(); }, []);
    const load = async () => { setLoading(true); try { const [exp, sum] = await Promise.all([getExpenses(), getFinancialSummary()]); setExpenses(exp); setSummary(sum); } catch (e) { console.error(e); } finally { setLoading(false); } };

    const confirmAction = (config: typeof modalConfig, action: () => Promise<void>) => { setModalConfig(config); setPendingAction(() => action); setModalState('CONFIRMATION'); };
    const executeAction = async () => { if (!pendingAction) return; setModalState('LOADING'); try { await pendingAction(); await load(); setModalState('SUCCESS'); } catch { setModalState('ERROR'); } };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.description || !form.amount) return;
        if (editingId) {
            confirmAction({ title: 'Update Expense', message: 'Save changes to this expense record?', isDanger: false, confirmText: 'Save', successMessage: 'Expense updated.' },
                async () => { await updateExpense(editingId, form); setEditingId(null); setShowForm(false); setForm({ description: '', amount: 0, category: 'OPERATIONS' }); });
        } else { await createExpense(form); setShowForm(false); setForm({ description: '', amount: 0, category: 'OPERATIONS' }); await load(); }
    };

    const handleEdit = (exp: ExpenseRecord) => { setEditingId(exp.id); setForm({ description: exp.description, amount: exp.amount, category: exp.category }); setShowForm(true); };
    const handleDelete = (exp: ExpenseRecord) => { confirmAction({ title: 'Delete Expense', message: `Permanently delete "${exp.description}" (${formatNaira(exp.amount)})? This cannot be undone.`, isDanger: true, confirmText: 'Delete', successMessage: 'Expense deleted.' }, async () => { await deleteExpense(exp.id); }); };

    const exportCsv = () => {
        const headers = ['Date', 'Description', 'Amount', 'Category'];
        const rows = expenses.map(e => [formatDate(e.createdAt), e.description, e.amount, e.category]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'expenses.csv'; link.click();
    };

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading financial data...</div>;

    return (
        <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-emerald-500" /><p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Inflow</p></div>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatNaira(summary.totalInflow)}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} className="text-red-500" /><p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Outflow</p></div>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">{formatNaira(summary.totalOutflow)}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><Wallet size={16} className="text-blue-500" /><p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Balance</p></div>
                    <p className={`text-3xl font-bold tabular-nums ${summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatNaira(summary.balance)}</p>
                </div>
            </div>

            {/* Breakdown by Category */}
            {Object.keys(summary.expenseByCategory).length > 0 && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Expense Breakdown</h3>
                    <div className="space-y-3">
                        {Object.entries(summary.expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                            const pct = summary.totalOutflow > 0 ? Math.round((amount / summary.totalOutflow) * 100) : 0;
                            return (<div key={cat}><div className="flex justify-between text-sm mb-1"><span className="text-slate-700 dark:text-slate-300 font-medium">{cat.replace(/_/g, ' ')}</span><span className="text-slate-500 dark:text-slate-400">{formatNaira(amount)} ({pct}%)</span></div><div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2"><div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} /></div></div>);
                        })}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex gap-2 justify-end">
                <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg font-medium text-sm hover:bg-emerald-100 transition"><Download size={16} /> Export</button>
                <button onClick={() => { setEditingId(null); setForm({ description: '', amount: 0, category: 'OPERATIONS' }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition shadow-sm"><Plus size={16} /> Record Expense</button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Expense' : 'Record Expense'}</h3>
                        <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                        <FormField label="Description" name="description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
                        <FormField label="Amount (₦)" name="amount" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} required prefix="₦" />
                        <FormField label="Category" name="category" type="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as ExpenseCategory }))} options={CATEGORIES} />
                        <div />
                        <div className="sm:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition shadow-sm">{editingId ? 'Save Changes' : 'Save Expense'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expense List */}
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {expenses.length === 0 ? (
                        <EmptyState title="No expenses" message="Record expenses to track financial outflow." icon={Wallet} action={{ label: 'Record Expense', onClick: () => setShowForm(true) }} />
                    ) : expenses.map(exp => (
                        <div key={exp.id} className="p-5 flex items-center justify-between gap-4 group">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{exp.description}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(exp.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={exp.category} />
                                <p className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">-{formatNaira(exp.amount)}</p>
                                <button onClick={() => handleEdit(exp)} className="p-1.5 text-slate-400 hover:text-primary-600 transition opacity-0 group-hover:opacity-100" title="Edit"><Pencil size={14} /></button>
                                <button onClick={() => handleDelete(exp)} className="p-1.5 text-slate-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100" title="Delete"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ActionModal isOpen={modalState !== 'HIDDEN'} state={modalState} title={modalConfig.title} message={modalConfig.message} isDanger={modalConfig.isDanger} confirmText={modalConfig.confirmText} successMessage={modalConfig.successMessage} onConfirm={executeAction} onClose={() => setModalState('HIDDEN')} />
        </div>
    );
};

export default FinanceTab;
