import React, { useEffect, useState } from 'react';
import {
    getAidApplications,
    updateAidApplicationStatus,
    deleteAidApplication,
    type AidApplicationRecord,
    type AidApplicationStatus
} from '../../lib/aidApplicationService';
import {
    Download,
    Mail,
    Phone,
    Search,
    MapPin,
    HandHeart,
    ChevronLeft,
    Users,
    DollarSign,
    FileText,
    Trash2,
} from 'lucide-react';
import ActionModal, { type ActionModalState } from '../../components/admin/ActionModal';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED'] as const;

const formatDate = (value: string) =>
    new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const escapeCsvCell = (value: string | number | boolean | undefined) => {
    const raw = value === undefined ? '' : String(value);
    return `"${raw.replace(/"/g, '""')}"`;
};

const statusBadgeClass = (status: AidApplicationStatus) => {
    switch (status) {
        case 'APPROVED':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
        case 'DECLINED':
            return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
        case 'UNDER_REVIEW':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
        default:
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
    }
};

const AidApplicationsList: React.FC = () => {
    const [applications, setApplications] = useState<AidApplicationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] =
        useState<(typeof STATUS_OPTIONS)[number]>('ALL');
    const [selectedApplication, setSelectedApplication] = useState<AidApplicationRecord | null>(null);

    // Modal State
    const [modalState, setModalState] = useState<ActionModalState>('HIDDEN');
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        isDanger: false,
    });
    const [pendingAction, setPendingAction] = useState<{ id: string; status?: AidApplicationStatus; type: 'status' | 'delete' } | null>(null);

    useEffect(() => {
        void fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await getAidApplications();
            setApplications(data);
        } catch (error) {
            console.error('Error fetching aid applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmStatusUpdate = (id: string, status: AidApplicationStatus) => {
        setPendingAction({ id, status, type: 'status' });
        
        const isDanger = status === 'DECLINED';
        const actionName = status === 'APPROVED' ? 'Approve Request' : status === 'UNDER_REVIEW' ? 'Under Review' : 'Decline';
        
        setModalConfig({
            title: `Confirm Action: ${actionName}`,
            message: `Are you sure you want to change the request status to ${status.replace('_', ' ')}? This will notify the applicant via email.`,
            isDanger,
        });
        setModalState('CONFIRMATION');
    };

    const confirmDelete = (app: AidApplicationRecord) => {
        setPendingAction({ id: app.id, type: 'delete' });
        setModalConfig({
            title: 'Delete Application',
            message: `Permanently delete the aid request from "${app.fullName}"? This action cannot be undone.`,
            isDanger: true,
        });
        setModalState('CONFIRMATION');
    };

    const executeStatusUpdate = async () => {
        if (!pendingAction) return;
        const { id, status, type } = pendingAction;
        
        setModalState('LOADING');
        try {
            if (type === 'delete') {
                await deleteAidApplication(id);
                setApplications((prev) => prev.filter((app) => app.id !== id));
                if (selectedApplication?.id === id) setSelectedApplication(null);
            } else if (status) {
                await updateAidApplicationStatus(id, status);
                setApplications((prev) =>
                    prev.map((app) =>
                        app.id === id ? { ...app, status } : app
                    )
                );
                if (selectedApplication && selectedApplication.id === id) {
                    setSelectedApplication(prev => prev ? { ...prev, status } : null);
                }
            }
            setModalState('SUCCESS');
        } catch (error) {
            console.error('Failed:', error);
            setModalState('ERROR');
        }
    };

    const filteredApplications = applications.filter((app) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            app.fullName.toLowerCase().includes(search) ||
            app.email.toLowerCase().includes(search) ||
            app.phone.toLowerCase().includes(search) ||
            app.aidCategory.toLowerCase().includes(search) ||
            app.city.toLowerCase().includes(search);

        const matchesStatus =
            statusFilter === 'ALL' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const exportToCsv = () => {
        const headers = [
            'Submitted At',
            'Status',
            'Full Name',
            'Phone',
            'Email',
            'Address',
            'City',
            'State',
            'Aid Category',
            'Household Size',
            'Monthly Income',
            'Description',
            'Referral Source',
        ];

        const rows = filteredApplications.map((app) => [
            formatDate(app.createdAt),
            app.status,
            app.fullName,
            app.phone,
            app.email,
            app.address,
            app.city,
            app.state,
            app.aidCategory,
            app.householdSize,
            app.monthlyIncome,
            app.description,
            app.referralSource,
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.setAttribute('download', 'aid-applications.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    };

    const statusCounts = applications.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
    }, {});

    if (loading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading aid applications...</div>;
    }

    return (
        <>
            {selectedApplication ? (
                <div className="space-y-6">
                    <button
                        onClick={() => setSelectedApplication(null)}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium"
                    >
                        <ChevronLeft size={20} /> Back to List
                    </button>

                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-white/10">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                            <div className="space-y-4 flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {selectedApplication.fullName}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Submitted {formatDate(selectedApplication.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass(selectedApplication.status)}`}
                                    >
                                        {selectedApplication.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Summary Cards */}
                                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm mt-4">
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><HandHeart size={13} /> Category</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {selectedApplication.aidCategory}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><DollarSign size={13} /> Amount Needed</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {selectedApplication.amountNeeded || 'Not specified'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><Users size={13} /> Household</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {selectedApplication.householdSize} person{selectedApplication.householdSize > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">Monthly Income</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {selectedApplication.monthlyIncome || 'Not specified'}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div className="grid lg:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white dark:bg-[#1F2937] border border-slate-100 dark:border-white/10 rounded-xl p-4 shadow-sm">
                                        <p className="text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                            <Phone size={14} /> Contact
                                        </p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedApplication.phone}</p>
                                        {selectedApplication.email && (
                                            <p className="text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2">
                                                <Mail size={14} /> {selectedApplication.email}
                                            </p>
                                        )}
                                        <p className="text-slate-600 dark:text-slate-300 mt-2 flex items-start gap-2">
                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                            {selectedApplication.address}, {selectedApplication.city}, {selectedApplication.state}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-2 font-semibold flex items-center gap-2">
                                            <FileText size={14} /> Summary
                                        </p>
                                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                                            {selectedApplication.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Full situation details */}
                                {selectedApplication.situationDetails && (
                                    <div className="bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl p-4 text-sm border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-2 font-semibold">Full Situation Details</p>
                                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                                            {selectedApplication.situationDetails}
                                        </p>
                                    </div>
                                )}

                                {/* Referral */}
                                {selectedApplication.referralSource && (
                                    <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Referral Source:</span> {selectedApplication.referralSource}
                                    </div>
                                )}

                                {/* Media Evidence */}
                                {(selectedApplication.photoUrls.length > 0 || selectedApplication.videoUrl) && (
                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 text-sm">
                                        <p className="text-blue-700 dark:text-blue-400 font-semibold mb-3">Media Evidence</p>
                                        {selectedApplication.photoUrls.length > 0 && (
                                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                                                {selectedApplication.photoUrls.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800/50 aspect-square bg-white dark:bg-slate-900 hover:opacity-80 transition">
                                                        <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        {selectedApplication.videoUrl && (
                                            <a
                                                href={selectedApplication.videoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                                            >
                                                ▶ Watch Applicant Video
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Admin Actions Panel */}
                            <div className="xl:w-64 space-y-3 bg-slate-50 dark:bg-[#1F2937] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/10">Admin Actions</h4>
                                {selectedApplication.status === 'APPROVED' || selectedApplication.status === 'DECLINED' ? (
                                    <div className={`p-4 rounded-lg text-center ${selectedApplication.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30'}`}>
                                        <p className={`text-sm font-bold ${selectedApplication.status === 'APPROVED' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                            Decision Finalized
                                        </p>
                                        <p className={`text-xs mt-1 ${selectedApplication.status === 'APPROVED' ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-red-600/70 dark:text-red-400/70'}`}>
                                            This request has been {selectedApplication.status === 'APPROVED' ? 'approved' : 'declined'}. No further action needed.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => confirmStatusUpdate(selectedApplication.id, 'UNDER_REVIEW')}
                                            className="w-full px-4 py-2.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
                                        >
                                            Under Review
                                        </button>
                                        <button
                                            onClick={() => confirmStatusUpdate(selectedApplication.id, 'APPROVED')}
                                            className="w-full px-4 py-2.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition"
                                        >
                                            Approve Request
                                        </button>
                                        <button
                                            onClick={() => confirmStatusUpdate(selectedApplication.id, 'DECLINED')}
                                            className="w-full px-4 py-2.5 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition"
                                        >
                                            Decline Application
                                        </button>
                                    </>
                                )}
                                {/* Delete Button - always visible */}
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                    <button onClick={() => confirmDelete(selectedApplication)}
                                        className="w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-2">
                                        <Trash2 size={14} /> Delete Application
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ) : (
        <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Requests</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{applications.length}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-500 mt-2">{statusCounts.PENDING || 0}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Under Review</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-500 mt-2">{statusCounts.UNDER_REVIEW || 0}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mt-2">{statusCounts.APPROVED || 0}</p>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/10 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aid / Help Requests</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Click on any request below to view full details and manage assistance.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={exportToCsv}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition text-sm"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                        <button
                            onClick={() => void fetchApplications()}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm"
                        >
                            Refresh List
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 bg-slate-50/50 dark:bg-[rgba(255,255,255,0.02)] border-b border-slate-100 dark:border-white/5 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, phone, email, category, or city..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                                    statusFilter === status
                                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {status.replace('_', ' ').charAt(0) + status.replace('_', ' ').slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#111827]">
                    {filteredApplications.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                            No aid applications match the current filters.
                        </div>
                    ) : (
                        filteredApplications.map((app) => (
                            <div
                                key={app.id}
                                onClick={() => setSelectedApplication(app)}
                                className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors group"
                            >
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                    <div className="min-w-[150px]">
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">{app.fullName}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{app.city}, {app.state}</p>
                                    </div>
                                    <div className="flex-1 hidden md:flex items-center gap-4">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 border-l-2 border-slate-200 dark:border-white/10 pl-4">
                                            {app.aidCategory}
                                        </p>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                            {app.householdSize} person{app.householdSize > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 min-w-[200px]">
                                    <div className="flex flex-col items-start sm:items-end">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass(app.status)}`}
                                        >
                                            {app.status.replace('_', ' ')}
                                        </span>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 whitespace-nowrap">{formatDate(app.createdAt)}</p>
                                    </div>
                                    <ChevronLeft size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 rotate-180 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
        )}

        <ActionModal
                isOpen={modalState !== 'HIDDEN'}
                state={modalState}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                onConfirm={executeStatusUpdate}
                onClose={() => setModalState('HIDDEN')}
            />
        </>
    );
};

export default AidApplicationsList;
