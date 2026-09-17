import React, { useEffect, useState } from 'react';
import { getNotifications, markAsRead, markAllAsRead, type NotificationRecord } from '../../lib/notificationService';
import EmptyState from '../../components/admin/EmptyState';
import { Bell, Check, CheckCheck } from 'lucide-react';

const formatDate = (v: string) => new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const NotificationsTab: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { void load(); }, []);

    const load = async () => {
        setLoading(true);
        try { setNotifications(await getNotifications()); } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleMarkRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading notifications...</div>;

    return (
        <div className="space-y-6">
            {unreadCount > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                    <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        <CheckCheck size={16} /> Mark all as read
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {notifications.length === 0 ? (
                        <EmptyState title="No notifications" message="You're all caught up! Notifications will appear here." icon={Bell} />
                    ) : notifications.map(n => (
                        <div key={n.id} className={`p-5 flex items-start gap-4 transition-colors ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-transparent'}`} />
                            <div className="flex-1">
                                <h3 className={`text-sm font-semibold ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</h3>
                                {n.body && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</p>}
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{formatDate(n.createdAt)}</p>
                            </div>
                            {!n.read && (
                                <button onClick={() => handleMarkRead(n.id)} className="p-1.5 text-slate-400 hover:text-primary-600 transition" title="Mark as read">
                                    <Check size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationsTab;
