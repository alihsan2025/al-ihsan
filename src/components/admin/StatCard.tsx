import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    accent?: string;
    bg?: string;
    prefix?: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon: Icon,
    accent = 'text-primary-600 dark:text-primary-400',
    bg = 'bg-primary-50 dark:bg-primary-900/20',
    prefix,
    onClick,
}) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm group hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
            <div className={`p-2 rounded-lg ${bg}`}>
                <Icon size={16} className={`${accent} stroke-[1.5]`} />
            </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
    </div>
);

export default StatCard;
