'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { pusherClient } from '@/lib/pusher';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationsRead, markSingleNotificationRead } from '@/app/actions';

interface Notification {
    id: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: Date;
    type: string;
    actorName?: string;
    actorImage?: string;
}

interface NotificationBellProps {
    userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showBadge, setShowBadge] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Fetch initial notifications
        const fetchNotifications = async () => {
            const data = await getNotifications();
            setNotifications(data as any);
            const initialUnread = data.filter(n => !n.read).length;
            setUnreadCount(initialUnread);
            if (initialUnread > 0) setShowBadge(true);
        };
        fetchNotifications();

        // Subscribe to user's private channel
        const channelName = `user-${userId}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind('new-notification', (data: any) => {
            const newNotification: Notification = {
                ...data,
                createdAt: new Date(data.createdAt),
            };

            setNotifications((prev) => [newNotification, ...prev]);
            if (!newNotification.read) {
                setUnreadCount((prev) => prev + 1);
                setShowBadge(true);
            }
        });

        return () => {
            pusherClient.unsubscribe(channelName);
        };
    }, [userId]);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setShowBadge(false);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read (optimistic)
        if (!notification.read) {
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            await markSingleNotificationRead(notification.id);
        }

        if (notification.link) {
            setIsOpen(false);
            router.push(notification.link);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleBellClick}
                className="relative p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
                <Bell size={20} />
                {showBadge && unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-32px)] sm:w-80 bg-jazz-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={async () => {
                                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                    setUnreadCount(0);
                                    await markNotificationsRead();
                                }}
                                className="text-[10px] text-jazz-gold hover:underline"
                            >
                                Marcar todas leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-white/30 text-xs italic">
                                No tienes notificaciones nuevas
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${notif.read ? 'opacity-60' : 'bg-jazz-gold/5'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 overflow-hidden">
                                        {notif.actorImage ? (
                                            <img src={notif.actorImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-jazz-gold text-[10px] font-bold">
                                                {notif.actorName?.slice(0, 2) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white leading-snug">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-white/40 mt-1">
                                            {notif.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2 h-2 rounded-full bg-jazz-gold shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
