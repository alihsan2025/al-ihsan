import React from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: LucideIcon;
    action?: { label: string; onClick: () => void };
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No data yet',
    message = 'There are no records to display.',
    icon: Icon = Inbox,
    action,
}) => (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
            <Icon size={32} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{message}</p>
        {action && (
            <button onClick={action.onClick} className="mt-4 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm">
                {action.label}
            </button>
        )}
    </div>
);

export default EmptyState;
