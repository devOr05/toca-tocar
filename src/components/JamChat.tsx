'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { Message, User } from '@/types';
import { sendMessage, getMessages } from '@/app/actions';
import { pusherClient } from '@/lib/pusher';

interface JamChatProps {
    jamId: string;
    currentUser: { id: string; name: string };
    themeId?: string; // Optional: specific theme chat
    title?: string;
    hostId?: string; // ID of the jam host
    isCommentMode?: boolean; // If true, rendering is more static-like
    users?: Partial<User>[];
}

export default function JamChat({ jamId, currentUser, themeId, title = 'Chat de la Jam', hostId, isCommentMode = false, ...props }: JamChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionIndex, setMentionIndex] = useState(0); // For keyboard navigation

    // Derived state for filtered users
    const filteredUsers = mentionQuery !== null && props.users
        ? props.users.filter(u =>
            u.name?.toLowerCase().includes(mentionQuery.toLowerCase()) &&
            u.id !== currentUser.id // Don't mention self
        )
        : [];

    // Real-time subscription
    useEffect(() => {
        // Initial load
        const fetchMessages = async () => {
            const msgs = await getMessages(jamId, themeId);
            setMessages(msgs);
        };
        fetchMessages();

        // Subscribe to Pusher channel
        const channelName = `jam-${jamId}`;
        const channel = pusherClient.subscribe(channelName);

        // Listen for new messages
        channel.bind('new-message', (data: Message) => {
            // Filter by theme if we are in a specific theme chat
            if (themeId && data.themeId !== themeId) return;
            if (!themeId && data.themeId) return; // Main chat shouldn't receive theme msgs if separated

            setMessages((prev) => {
                // Prevent duplicates if optimistic update already added it
                if (prev.some(m => m.id === data.id)) return prev;
                // Remove temporary optimistic message if it matches content/user (simple dedup)
                const filtered = prev.filter(m => !m.id.startsWith('temp-') || m.content !== data.content);
                return [...filtered, data];
            });

            // Trigger scroll
            setTimeout(() => {
                if (messagesEndRef.current) {
                    const container = messagesEndRef.current.parentElement;
                    if (container) {
                        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                    }
                }
            }, 100);
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(channelName);
        };
    }, [jamId, themeId]);

    // Auto-scroll logic (Simplified)
    // Auto-scroll logic (Conditioned)
    // Simplified Auto-scroll
    useEffect(() => {
        const container = messagesEndRef.current?.parentElement;
        if (!container) return;

        // Force scroll to bottom on every message change
        // This is "brute force" but ensures users always see the latest in a live jam context
        // We can optimize later if reading history becomes annoying, but for now "live" is priority
        setTimeout(() => {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }, 100);
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNewMessage(val);

        // Detect mention
        const lastWord = val.split(' ').pop();
        if (lastWord && lastWord.startsWith('@')) {
            setMentionQuery(lastWord.slice(1));
            setMentionIndex(0); // Reset index on new query
        } else {
            setMentionQuery(null);
        }
    };

    const insertMention = (userName: string) => {
        const words = newMessage.split(' ');
        words.pop(); // Remove the incomplete @mention
        setNewMessage([...words, `@${userName} `].join(' '));
        setMentionQuery(null);
        // Focus back on input (simple implementation)
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage;
        const tempId = `temp-${Date.now()}`;

        // Optimistic update
        const tempMsg: Message = {
            id: tempId,
            content: content,
            userId: currentUser.id,
            userName: currentUser.name,
            jamId: jamId,
            themeId: themeId,
            createdAt: new Date()
        };

        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');
        // No longer using isLoading to block input, allowing faster consecutive messages

        try {
            const result = await sendMessage(jamId, content, themeId);
            if (!result.success) {
                console.error('Error sending message:', result.error);
                // Remove optimistic message if failed
                setMessages(prev => prev.filter(m => m.id !== tempId));
                setNewMessage(content); // Restore message
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setNewMessage(content);
        } finally {
            setMentionQuery(null);
        }
    };

    // Removed isCommentMode early return to allow full chat interface

    return (
        <div className="flex flex-col h-full bg-black/20 rounded-xl overflow-hidden border border-white/5 relative">
            {/* MENTION POPUP */}
            {mentionQuery !== null && filteredUsers.length > 0 && (
                <div className="absolute bottom-16 left-4 right-4 bg-jazz-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-40 overflow-y-auto">
                    {filteredUsers.map((u, i) => (
                        <button
                            key={u.id}
                            onClick={() => insertMention(u.name || 'Usuario')}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${i === mentionIndex ? 'bg-white/5' : ''}`}
                        >
                            <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden">
                                {u.image ? <img src={u.image} alt={u.name || ''} className="w-full h-full object-cover" /> : <div className="text-[10px] flex items-center justify-center h-full">👤</div>}
                            </div>
                            <span className="text-sm font-bold text-white">{u.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {title && (
                <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2 shrink-0">
                    <MessageSquare size={16} className="text-jazz-gold" />
                    <h3 className="font-bold text-sm text-white">{title}</h3>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 order-1 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                        <MessageSquare size={32} className="mb-2" />
                        <p className="text-xs italic">Aún no hay mensajes...</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.userId === currentUser.id;
                    const isHost = msg.userId === hostId;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 shadow-lg ${isMe
                                ? 'bg-jazz-gold/10 border border-jazz-gold/20 text-white rounded-2xl rounded-tr-none'
                                : isHost
                                    ? 'bg-jazz-accent/10 border border-jazz-accent/30 text-white rounded-2xl rounded-tl-none'
                                    : 'bg-white/5 border border-white/5 text-gray-200 rounded-2xl rounded-tl-none'
                                }`}>
                                {!isMe && (
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isHost ? 'text-jazz-accent' : 'text-jazz-gold'}`}>
                                            {msg.userName}
                                        </span>
                                        {isHost && <span className="text-[8px] bg-jazz-accent/20 text-jazz-accent px-1 rounded border border-jazz-accent/30 font-bold">HOST</span>}
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.content.split(' ').map((word, i) => (
                                        word.startsWith('@') ?
                                            <span key={i} className="text-jazz-accent font-bold hover:underline cursor-pointer">{word}</span>
                                            : <span key={i}>{word} </span>
                                    ))}
                                </p>
                                <span className="text-[8px] opacity-30 block text-right mt-1 font-mono uppercase">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/10 flex gap-2 order-2 shrink-0">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder={isCommentMode ? "Escribe un comentario..." : "Escribe un mensaje..."}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-jazz-gold/50 focus:bg-white/10 outline-none transition-all"
                    autoFocus={!isCommentMode}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-jazz-gold text-black p-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-lg shadow-jazz-gold/10"
                >
                    <Send size={20} />
                </button>
            </form>

        </div>
    );
}
