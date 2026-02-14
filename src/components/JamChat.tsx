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
    isCommentMode?: boolean; // If true, rendering is more static-like
}

export default function JamChat({ jamId, currentUser, themeId, title = 'Chat de la Jam', hostId, isCommentMode = false }: JamChatProps) {
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

    // Auto-scroll logic: scroll container only, avoid page jumps
    useEffect(() => {
        if (isCommentMode) return; // Don't auto-scroll in comment mode
        const container = messagesEndRef.current?.parentElement;
        if (!container) return;

        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

        if (isNearBottom) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isCommentMode]);

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

    if (isCommentMode) {
        return (
            <div className="flex flex-col h-full bg-black/20 rounded-xl overflow-hidden border border-white/5">
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <p className="text-center text-white/20 text-xs italic py-4">
                            No hay comentarios aún.
                        </p>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className="border-b border-white/5 pb-4 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-jazz-gold uppercase">
                                    {msg.userName.slice(0, 2)}
                                </div>
                                <span className="text-xs font-bold text-white">{msg.userName}</span>
                                <span className="text-[10px] text-white/20">
                                    {new Date(msg.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed pl-8">{msg.content}</p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un comentario..."
                        rows={2}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-jazz-accent outline-none resize-none mb-2"
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-jazz-accent text-black px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                        >
                            <Send size={14} />
                            Publicar Comentario
                        </button>
                    </div>
                </form>
            </div>
        );
    }

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
