import React, { useEffect, useState } from 'react';
import { getTeamMembers, updateTeamMemberRole, updateTeamMemberProfile, deleteTeamMember, createTeamMember, type TeamMember, type TeamRole, type TeamMemberInput } from '../../lib/teamService';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import ActionModal, { type ActionModalState } from '../../components/admin/ActionModal';
import { Users, Shield, Save, Trash2, Pencil, Plus, X, Mail, Phone, UserPlus } from 'lucide-react';

const ROLES: { value: TeamRole; label: string; desc: string }[] = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full access to everything' },
    { value: 'FINANCE', label: 'Finance', desc: 'Donations, donors, expenses, analytics' },
    { value: 'MODERATOR', label: 'Moderator', desc: 'Cases, requests, volunteers, content' },
    { value: 'FIELD_AGENT', label: 'Field Agent', desc: 'Assigned cases and requests' },
];

const TeamTab: React.FC = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState<TeamMemberInput>({ email: '', fullName: '', phone: '', role: 'FIELD_AGENT' });
    const [addError, setAddError] = useState('');

    const [modalState, setModalState] = useState<ActionModalState>('HIDDEN');
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', isDanger: false, confirmText: 'Confirm', successMessage: '' });
    const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

    useEffect(() => { void load(); }, []);
    const load = async () => { setLoading(true); try { setMembers(await getTeamMembers()); } catch (e) { console.error(e); } finally { setLoading(false); } };

    const confirmAction = (config: typeof modalConfig, action: () => Promise<void>) => { setModalConfig(config); setPendingAction(() => action); setModalState('CONFIRMATION'); };
    const executeAction = async () => { if (!pendingAction) return; setModalState('LOADING'); try { await pendingAction(); await load(); setModalState('SUCCESS'); } catch { setModalState('ERROR'); } };

    const handleRoleChange = (id: string, currentRole: TeamRole, newRole: TeamRole) => {
        if (currentRole === newRole) return;
        confirmAction(
            { title: 'Change Role', message: `Change this team member's role to "${ROLES.find(r => r.value === newRole)?.label}"?`, isDanger: false, confirmText: 'Change Role', successMessage: 'Role updated successfully.' },
            async () => { await updateTeamMemberRole(id, newRole); }
        );
    };

    const handleEdit = (m: TeamMember) => { setEditing(m.id); setEditForm({ fullName: m.fullName, phone: m.phone }); };

    const handleSaveProfile = (id: string) => {
        confirmAction(
            { title: 'Update Profile', message: 'Save changes to this team member\'s profile?', isDanger: false, confirmText: 'Save', successMessage: 'Profile updated.' },
            async () => { await updateTeamMemberProfile(id, editForm); setEditing(null); }
        );
    };

    const handleDelete = (m: TeamMember) => {
        confirmAction(
            { title: 'Remove Team Member', message: `Remove "${m.fullName}" from the admin team? They will lose all admin access. This cannot be undone.`, isDanger: true, confirmText: 'Remove', successMessage: 'Team member removed.' },
            async () => { await deleteTeamMember(m.id); }
        );
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError('');
        if (!addForm.email || !addForm.fullName) return;

        // Check for duplicate email
        if (members.some(m => m.email.toLowerCase() === addForm.email.toLowerCase())) {
            setAddError('A team member with this email already exists.');
            return;
        }

        try {
            await createTeamMember(addForm);
            setShowAddForm(false);
            setAddForm({ email: '', fullName: '', phone: '', role: 'FIELD_AGENT' });
            await load();
        } catch (err: any) {
            console.error('Failed to add member:', err);
            setAddError(err?.message || 'Failed to add team member. Please try again.');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading team...</div>;

    return (
        <div className="space-y-6">
            {/* Header + Add Button */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{members.length} registered admin{members.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition shadow-sm">
                    <UserPlus size={16} /> Add Member
                </button>
            </div>

            {/* Add Member Form */}
            {showAddForm && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Team Member</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Add a new admin to the team and assign their role.</p>
                        </div>
                        <button onClick={() => { setShowAddForm(false); setAddError(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={20} /></button>
                    </div>

                    {addError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                            {addError}
                        </div>
                    )}

                    <form onSubmit={handleAddMember} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                                <input required value={addForm.fullName} onChange={e => setAddForm(p => ({ ...p, fullName: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                                    placeholder="e.g. Abubakar Ibrahim" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input required type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                                        placeholder="admin@al-ihsan.org" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                                        placeholder="+234 800 000 0000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role *</label>
                                <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value as TeamRole }))}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white">
                                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Role Preview */}
                        <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
                                    {addForm.fullName ? addForm.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{addForm.fullName || 'New Member'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{addForm.email || 'email@example.com'}</p>
                                </div>
                                <StatusBadge status={addForm.role} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => { setShowAddForm(false); setAddError(''); }}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition shadow-sm flex items-center gap-2">
                                <Plus size={16} /> Add to Team
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Role Definitions */}
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2"><Shield size={16} className="text-slate-400" /> Role Definitions</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    {ROLES.map(r => (
                        <div key={r.value} className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                            <StatusBadge status={r.value} className="mb-2" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Members List */}
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-white/10">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Team Members</h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {members.length === 0 ? (
                        <EmptyState title="No team members" message="Add your first team member to get started." icon={Users} action={{ label: 'Add Member', onClick: () => setShowAddForm(true) }} />
                    ) : members.map(m => (
                        <div key={m.id} className="p-5 group">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
                                        {m.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        {editing === m.id ? (
                                            <div className="flex items-center gap-2">
                                                <input value={editForm.fullName} onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                                                    className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white" placeholder="Name" />
                                                <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                                    className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white" placeholder="Phone" />
                                                <button onClick={() => handleSaveProfile(m.id)} className="p-1 text-emerald-600 hover:text-emerald-700"><Save size={16} /></button>
                                                <button onClick={() => setEditing(null)} className="p-1 text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{m.fullName}</h3>
                                                    <button onClick={() => handleEdit(m)} className="p-1 text-slate-400 hover:text-primary-600 transition opacity-0 group-hover:opacity-100" title="Edit"><Pencil size={12} /></button>
                                                    <button onClick={() => handleDelete(m)} className="p-1 text-slate-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100" title="Remove"><Trash2 size={12} /></button>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ROLES.map(r => (
                                        <button key={r.value} onClick={() => handleRoleChange(m.id, m.role, r.value)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${m.role === r.value ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ActionModal isOpen={modalState !== 'HIDDEN'} state={modalState} title={modalConfig.title} message={modalConfig.message} isDanger={modalConfig.isDanger} confirmText={modalConfig.confirmText} successMessage={modalConfig.successMessage} onConfirm={executeAction} onClose={() => setModalState('HIDDEN')} />
        </div>
    );
};

export default TeamTab;
