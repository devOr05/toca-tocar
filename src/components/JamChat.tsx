'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { Message } from '@/types';
import { sendMessage, getMessages } from '@/app/actions';

interface JamChatProps {
    jamId: string;
    currentUser: { id: string; name: string };
    themeId?: string; // Optional: specific theme chat
    title?: string;
    hostId?: string; // ID of the jam host
}

export default function JamChat({ jamId, currentUser, themeId, title = 'Chat de la Jam', hostId }: JamChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Polling for messages
    useEffect(() => {
        const fetchMessages = async () => {
            const msgs = await getMessages(jamId, themeId);
            setMessages(msgs);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [jamId, themeId]);

    // Auto-scroll to bottom only if user is already near bottom
    useEffect(() => {
        const container = messagesEndRef.current?.parentElement;
        if (!container) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Check if user is near bottom (within 100px)
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        if (isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempMessage: Message = {
            id: 'temp-' + Date.now(),
            content: newMessage,
            userId: currentUser.id,
            userName: currentUser.name,
            jamId,
            themeId,
            createdAt: new Date()
        };

        // Optimistic update
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        await sendMessage(jamId, tempMessage.content, themeId);
        // The polling will reconcile the ID later
    };

    return (
        <div className="flex flex-col h-full bg-black/20 rounded-xl overflow-hidden border border-white/5">
            <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2">
                <MessageSquare size={16} className="text-jazz-gold" />
                <h3 className="font-bold text-sm text-white">{title}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {messages.length === 0 && (
                    <p className="text-center text-white/20 text-xs italic py-4">
                        Sé el primero en escribir...
                    </p>
                )}


                {messages.map((msg) => {
                    const isMe = msg.userId === currentUser.id;
                    const isHost = msg.userId === hostId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-3 ${isMe
                                ? 'bg-jazz-gold/10 border border-jazz-gold/20 text-white rounded-tr-none'
                                : 'bg-white/10 border border-white/5 text-gray-200 rounded-tl-none'
                                }`}>
                                {!isMe && (
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[10px] font-bold text-jazz-muted uppercase">{msg.userName}</span>
                                        {isHost && (
                                            <span className="text-[8px] bg-jazz-gold/20 text-jazz-gold px-1.5 py-0.5 rounded-full border border-jazz-gold/30 font-bold uppercase">
                                                Host
                                            </span>
                                        )}
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                <span className="text-[9px] opacity-40 block text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-jazz-gold outline-none"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-jazz-gold text-black p-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
