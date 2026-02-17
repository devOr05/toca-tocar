'use client';

import { useState, useEffect } from 'react';
import { X, Send, Loader, MessageSquare } from 'lucide-react';
import { pusherClient } from '@/lib/pusher';
import { getDirectMessages, sendDirectMessage } from '@/app/actions';

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    createdAt: Date;
    read: boolean;
}

interface DMChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: { id: string; name: string };
    receiver: { id: string; name: string; image?: string | null };
}

export default function DMChatModal({ isOpen, onClose, currentUser, receiver }: DMChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const loadMessages = async () => {
            setIsFetching(true);
            const data = await getDirectMessages(receiver.id);
            setMessages(data as any);
            setIsFetching(false);
        };

        loadMessages();

        // Subscribe to user's private channel for new DMs
        const channelName = `user-${currentUser.id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind('new-dm', (data: any) => {
            // Only add if it's from this specific receiver
            if (data.senderId === receiver.id) {
                setMessages(prev => [...prev, {
                    ...data,
                    createdAt: new Date(data.createdAt)
                }]);
            }
        });

        return () => {
            pusherClient.unsubscribe(channelName);
        };
    }, [isOpen, receiver.id, currentUser.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        const content = newMessage;
        setNewMessage('');
        setIsLoading(true);

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const tempMsg: Message = {
            id: tempId,
            content,
            senderId: currentUser.id,
            senderName: currentUser.name,
            receiverId: receiver.id,
            createdAt: new Date(),
            read: false
        };
        setMessages(prev => [...prev, tempMsg]);

        const result = await sendDirectMessage(receiver.id, content);
        if (!result.success) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setNewMessage(content);
        } else {
            // Replace temp message with real one if needed, or just let it be
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: (result as any).message.id } : m));
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-jazz-surface border border-white/10 rounded-2xl w-full max-w-sm h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden ring-1 ring-jazz-gold/30">
                            {receiver.image ? (
                                <img src={receiver.image} alt={receiver.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">{receiver.name}</div>
                            <div className="text-[10px] text-jazz-gold font-bold uppercase tracking-widest flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> Directo
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {isFetching ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader className="animate-spin text-jazz-gold" size={24} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                <MessageSquare size={24} />
                            </div>
                            <p className="text-xs text-white/30 italic">Comienza una conversación con {receiver.name}</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.senderId === currentUser.id ? 'bg-jazz-gold text-black rounded-tr-none font-medium' : 'bg-white/5 text-white border border-white/10 rounded-tl-none'}`}>
                                    {msg.content}
                                    <div className={`text-[9px] mt-1 ${msg.senderId === currentUser.id ? 'text-black/60' : 'text-white/40'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/40">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-jazz-gold transition-colors"
                        />
                        <button
                            disabled={!newMessage.trim() || isLoading}
                            className="bg-jazz-gold text-black p-2 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-jazz-gold/10"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
