import React, { useEffect, useState } from 'react';
import {
    getVolunteerApplications,
    updateVolunteerApplicationStatus,
    deleteVolunteerApplication,
    type VolunteerApplicationRecord,
    type VolunteerApplicationStatus
} from '../../lib/volunteerApplicationService';
import {
    Download,
    Mail,
    Phone,
    Search,
    ShieldCheck,
    UserCheck,
    ChevronLeft,
    Trash2
} from 'lucide-react';
import ActionModal, { type ActionModalState } from '../../components/admin/ActionModal';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'REVIEWED', 'SHORTLISTED', 'DECLINED'] as const;

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

const VolunteerApplicationsList: React.FC = () => {
    const [applications, setApplications] = useState<VolunteerApplicationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] =
        useState<(typeof STATUS_OPTIONS)[number]>('ALL');
    const [selectedApplication, setSelectedApplication] = useState<VolunteerApplicationRecord | null>(null);

    // Modal State
    const [modalState, setModalState] = useState<ActionModalState>('HIDDEN');
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        isDanger: false,
    });
    const [pendingAction, setPendingAction] = useState<{ id: string; status?: VolunteerApplicationStatus; type: 'status' | 'delete' } | null>(null);

    useEffect(() => {
        void fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await getVolunteerApplications();
            setApplications(data);
        } catch (error) {
            console.error('Error fetching volunteer applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmStatusUpdate = (id: string, status: VolunteerApplicationStatus) => {
        setPendingAction({ id, status, type: 'status' });
        
        const isDanger = status === 'DECLINED';
        const actionName = status === 'SHORTLISTED' ? 'Shortlist' : status === 'REVIEWED' ? 'Mark as Reviewed' : 'Decline';
        
        setModalConfig({
            title: `Confirm Action: ${actionName}`,
            message: `Are you sure you want to change the applicant's status to ${status}? This will notify the applicant via email.`,
            isDanger,
        });
        setModalState('CONFIRMATION');
    };

    const confirmDelete = (app: VolunteerApplicationRecord) => {
        setPendingAction({ id: app.id, type: 'delete' });
        setModalConfig({
            title: 'Delete Application',
            message: `Permanently delete the volunteer application from "${app.fullName}"? This action cannot be undone.`,
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
                await deleteVolunteerApplication(id);
                setApplications((prev) => prev.filter((app) => app.id !== id));
                if (selectedApplication?.id === id) setSelectedApplication(null);
            } else if (status) {
                await updateVolunteerApplicationStatus(id, status);
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

    const filteredApplications = applications.filter((application) => {
        const matchesSearch =
            application.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            application.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            application.phone.includes(searchTerm) ||
            application.preferredRole.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'ALL' || application.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const exportToCsv = () => {
        const headers = [
            'Submitted At',
            'Status',
            'Full Name',
            'Date of Birth',
            'Age',
            'Gender',
            'Phone',
            'Email',
            'City',
            'State',
            'Address',
            'Occupation',
            'Marital Status',
            'Preferred Role',
            'Availability',
            'Mosque/Community',
            'Available for Outreach',
            'Emergency Contact Name',
            'Emergency Contact Relationship',
            'Emergency Contact Phone',
            'Experience',
            'Motivation',
            'Amanah Answer',
            'Confidentiality Answer',
            'Adab Answer',
            'Scenario Response',
            'Quiz Score',
            'Accepted Terms',
            'Accepted Privacy',
            'Accepted Confidentiality',
            'Document URL',
        ];

        const rows = filteredApplications.map((application) => [
            formatDate(application.createdAt),
            application.status,
            application.fullName,
            application.dateOfBirth,
            application.age,
            application.gender,
            application.phone,
            application.email,
            application.city,
            application.state,
            application.address,
            application.occupation,
            application.maritalStatus,
            application.preferredRole,
            application.availability,
            application.mosqueCommunity,
            application.availableForOutreach ? 'Yes' : 'No',
            application.emergencyContactName,
            application.emergencyContactRelationship,
            application.emergencyContactPhone,
            application.experience,
            application.motivation,
            application.qAmanah,
            application.qConfidentiality,
            application.qAdab,
            application.scenarioResponse,
            application.quizScore,
            application.acceptedTerms,
            application.acceptedPrivacy,
            application.acceptedConfidentiality,
            application.idDocumentUrl || '',
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.setAttribute('download', 'volunteer-applications.csv');
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
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading volunteer applications...</div>;
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
                                        className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-xs font-bold ${
                                            selectedApplication.status === 'SHORTLISTED'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                : selectedApplication.status === 'DECLINED'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                    : selectedApplication.status === 'REVIEWED'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                        }`}
                                    >
                                        {selectedApplication.status}
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm mt-4">
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">DOB / Age / Gender</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {selectedApplication.dateOfBirth ? formatDate(selectedApplication.dateOfBirth).split(',')[0] : 'N/A'} / {selectedApplication.age} / {selectedApplication.gender}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">Preferred Role</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {selectedApplication.preferredRole}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">Availability</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {selectedApplication.availability}
                                        </p>
                                        {selectedApplication.availableForOutreach !== undefined && (
                                            <p className="text-xs text-primary-700 dark:text-primary-400 mt-1 font-medium bg-primary-50 dark:bg-primary-900/30 inline-block px-2 py-0.5 rounded">
                                                Outreach: {selectedApplication.availableForOutreach ? 'Yes' : 'No'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#1F2937] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">Quiz Score</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {selectedApplication.quizScore}%
                                        </p>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white dark:bg-[#1F2937] border border-slate-100 dark:border-white/10 rounded-xl p-4 shadow-sm">
                                        <p className="text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                            <Phone size={14} /> Contact
                                        </p>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedApplication.phone}</p>
                                        <p className="text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2">
                                            <Mail size={14} /> {selectedApplication.email}
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-300 mt-2">
                                            {selectedApplication.address}, {selectedApplication.city}, {selectedApplication.state}
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-[#1F2937] border border-slate-100 dark:border-white/10 rounded-xl p-4 shadow-sm">
                                        <p className="text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                            <UserCheck size={14} /> Background
                                        </p>
                                        <p><span className="font-semibold text-slate-900 dark:text-white">Occupation:</span> <span className="text-slate-700 dark:text-slate-300">{selectedApplication.occupation}</span></p>
                                        <p className="mt-1"><span className="font-semibold text-slate-900 dark:text-white">Marital Status:</span> <span className="text-slate-700 dark:text-slate-300">{selectedApplication.maritalStatus}</span></p>
                                        <p className="mt-1"><span className="font-semibold text-slate-900 dark:text-white">Community:</span> <span className="text-slate-700 dark:text-slate-300">{selectedApplication.mosqueCommunity}</span></p>
                                        <p className="mt-1"><span className="font-semibold text-slate-900 dark:text-white">Emergency:</span> <span className="text-slate-700 dark:text-slate-300">{selectedApplication.emergencyContactName} ({selectedApplication.emergencyContactRelationship ? `${selectedApplication.emergencyContactRelationship}, ` : ''}{selectedApplication.emergencyContactPhone})</span></p>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-2 font-semibold">Experience</p>
                                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                                            {selectedApplication.experience}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-transparent dark:border-white/5">
                                        <p className="text-slate-500 dark:text-slate-400 mb-2 font-semibold">Motivation</p>
                                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                                            {selectedApplication.motivation}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 rounded-xl p-4">
                                        <p className="text-primary-800 dark:text-primary-300 font-semibold mb-3">
                                            Islamic Volunteer Readiness
                                        </p>
                                        <p><span className="font-semibold text-primary-900 dark:text-primary-100 block">Amanah:</span> <span className="text-primary-800 dark:text-primary-300">{selectedApplication.qAmanah}</span></p>
                                        <p className="mt-3"><span className="font-semibold text-primary-900 dark:text-primary-100 block">Confidentiality:</span> <span className="text-primary-800 dark:text-primary-300">{selectedApplication.qConfidentiality}</span></p>
                                        <p className="mt-3"><span className="font-semibold text-primary-900 dark:text-primary-100 block">Adab:</span> <span className="text-primary-800 dark:text-primary-300">{selectedApplication.qAdab}</span></p>
                                    </div>
                                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 rounded-xl p-4">
                                        <p className="text-primary-800 dark:text-primary-300 font-semibold mb-3">
                                            Scenario Response
                                        </p>
                                        <p className="text-primary-800 dark:text-primary-300 whitespace-pre-line leading-relaxed italic border-l-2 border-primary-300 dark:border-primary-700 pl-3">
                                            "{selectedApplication.scenarioResponse}"
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-700/30 rounded-xl p-5 text-sm">
                                    <p className="font-semibold text-amber-800 dark:text-amber-500 mb-3 flex items-center gap-2">
                                        <ShieldCheck size={16} /> Compliance Declarations
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-3 text-amber-900 dark:text-amber-200 font-medium">
                                        <p className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${selectedApplication.acceptedTerms ? 'bg-amber-500' : 'bg-red-400'}`}></span> Terms: {selectedApplication.acceptedTerms ? 'Accepted' : 'Missing'}</p>
                                        <p className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${selectedApplication.acceptedPrivacy ? 'bg-amber-500' : 'bg-red-400'}`}></span> Privacy: {selectedApplication.acceptedPrivacy ? 'Accepted' : 'Missing'}</p>
                                        <p className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${selectedApplication.acceptedConfidentiality ? 'bg-amber-500' : 'bg-red-400'}`}></span> Confidentiality: {selectedApplication.acceptedConfidentiality ? 'Accepted' : 'Missing'}</p>
                                    </div>
                                    {selectedApplication.idDocumentUrl && (
                                        <a
                                            href={selectedApplication.idDocumentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block mt-4 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                        >
                                            View Uploaded Document
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="xl:w-64 space-y-3 bg-slate-50 dark:bg-[#1F2937] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-white/10">Admin Actions</h4>
                                {selectedApplication.status === 'SHORTLISTED' || selectedApplication.status === 'DECLINED' ? (
                                    <div className={`p-4 rounded-lg text-center ${selectedApplication.status === 'SHORTLISTED' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30'}`}>
                                        <p className={`text-sm font-bold ${selectedApplication.status === 'SHORTLISTED' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                            Decision Finalized
                                        </p>
                                        <p className={`text-xs mt-1 ${selectedApplication.status === 'SHORTLISTED' ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-red-600/70 dark:text-red-400/70'}`}>
                                            This applicant has been {selectedApplication.status === 'SHORTLISTED' ? 'shortlisted' : 'declined'}. No further action needed.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => confirmStatusUpdate(selectedApplication.id, 'REVIEWED')}
                                            className="w-full px-4 py-2.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
                                        >
                                            Mark as Reviewed
                                        </button>
                                        <button
                                            onClick={() => confirmStatusUpdate(selectedApplication.id, 'SHORTLISTED')}
                                            className="w-full px-4 py-2.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition"
                                        >
                                            Shortlist Applicant
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
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Applicants</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{applications.length}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pending Review</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-500 mt-2">{statusCounts.PENDING || 0}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Shortlisted</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mt-2">{statusCounts.SHORTLISTED || 0}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Quiz Score</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                        {applications.length
                            ? Math.round(
                                applications.reduce((sum, item) => sum + item.quizScore, 0) /
                                applications.length
                            )
                            : 0}
                        %
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-white/10 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Volunteer Applications</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Click on any applicant below to view their full detailed application profile.
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

                <div className="p-4 bg-slate-50/50 dark:bg-[rgba(255,255,255,0.02)] border-b border-slate-100 dark:border-white/5 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by applicant, email, phone, or role..."
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
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#111827]">
                    {filteredApplications.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                            No volunteer applications match the current filters.
                        </div>
                    ) : (
                        filteredApplications.map((application) => (
                            <div 
                                key={application.id} 
                                onClick={() => setSelectedApplication(application)}
                                className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors group"
                            >
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                    <div className="min-w-[150px]">
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">{application.fullName}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{application.city}, {application.state}</p>
                                    </div>
                                    <div className="flex-1 hidden md:block">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 border-l-2 border-slate-200 dark:border-white/10 pl-4">
                                            {application.preferredRole}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 min-w-[200px]">
                                    <div className="flex flex-col items-start sm:items-end">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                application.status === 'SHORTLISTED'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                    : application.status === 'DECLINED'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                        : application.status === 'REVIEWED'
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                            }`}
                                        >
                                            {application.status}
                                        </span>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 whitespace-nowrap">{formatDate(application.createdAt)}</p>
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

export default VolunteerApplicationsList;
