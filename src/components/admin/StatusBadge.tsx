import React from 'react';

const COLOR_MAP: Record<string, string> = {
    // Green family
    APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    VERIFIED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    SHORTLISTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    ONLINE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    // Blue family
    REVIEWED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    UNDER_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    FUNDRAISING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    // Amber family
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    ONE_TIME: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    NORMAL: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    // Red family
    DECLINED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    // Purple family
    URGENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    MAJOR: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    FREQUENT: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    SUPER_ADMIN: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400',
    // Misc
    ARCHIVED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const colors = COLOR_MAP[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    const label = status.replace(/_/g, ' ');

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors} ${className}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
