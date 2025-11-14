import React, { useEffect, useState } from 'react';
import ResizablePanel from './ResizablePanel';
import { Button } from '@/components/ui/button';

interface ChatMessage {
    id: string;
    from: 'user' | 'assistant';
    text: string;
}

interface GlobalMessage {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string | number | Date;
    type?: string;
}

interface AIAssistProps {
    globalMessages?: GlobalMessage[];
}

export const AIAssist = ({ globalMessages }: AIAssistProps) => {
    const [open, setOpen] = useState(false);
    const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([]);
    const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
    const [viewMode, setViewMode] = useState<'assistant' | 'global'>('assistant');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendPrompt = async (prompt: string) => {
        if (!prompt.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), from: 'user', text: prompt };
        setAssistantMessages((m) => [...m, userMsg]);
        if (viewMode === 'assistant') setDisplayedMessages((m) => [...m, userMsg]);
        setInput('');
        setLoading(true);

        // Try relative path first (works when proxying /api to backend),
        // otherwise fall back to explicit backend host for local dev.
        const endpoints = ['/api/assistant', 'http://localhost:3001/api/assistant'];
        let lastError: any = null;

        for (const url of endpoints) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                if (!res.ok) {
                    // capture body for debugging
                    const text = await res.text().catch(() => '<no body>');
                    lastError = new Error(`Status ${res.status}: ${text}`);
                    console.error('Assistant request failed', url, res.status, text);
                    continue; // try next endpoint
                }

                const data = await res.json();
                const assistantText = data && data.reply ? data.reply : JSON.stringify(data);
                const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), from: 'assistant', text: assistantText };
                setAssistantMessages((m) => [...m, assistantMsg]);
                if (viewMode === 'assistant') setDisplayedMessages((m) => [...m, assistantMsg]);
                lastError = null;
                break; // success
            } catch (err) {
                console.error('Assistant request error', err);
                lastError = err;
                // try next endpoint
            }
        }

        if (lastError) {
            const errMsg: ChatMessage = { id: (Date.now() + 2).toString(), from: 'assistant', text: `Error: could not reach assistant (${lastError?.message || lastError})` };
            setAssistantMessages((m) => [...m, errMsg]);
            if (viewMode === 'assistant') setDisplayedMessages((m) => [...m, errMsg]);
        }

        setLoading(false);
    };

    // Keep displayed messages in sync when opening or switching views
    useEffect(() => {
        if (!open) return;
        if (viewMode === 'assistant') {
            setDisplayedMessages(assistantMessages);
        } else {
            const gm = (globalMessages || []).map(g => ({ id: g.id, from: 'user' as const, text: `${g.userName}: ${g.content}` }));
            setDisplayedMessages(gm);
        }
    }, [open, viewMode, assistantMessages, globalMessages]);

    return (
        <>
            {/* Floating AI icon */}
            <button
                aria-label="AI Assist"
                onClick={() => setOpen((s) => !s)}
                className="fixed left-6 bottom-6 z-60 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center"
            >
                🤖
            </button>

            {open && (
                <ResizablePanel initialWidth={420} initialHeight={520} initialX={80} initialY={80}>
                    <div className="p-3 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-2">
                                <button
                                    className={`px-2 py-1 rounded ${viewMode === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-transparent text-sm'}`}
                                    onClick={() => setViewMode('assistant')}
                                >
                                    Assistant
                                </button>
                                <button
                                    className={`px-2 py-1 rounded ${viewMode === 'global' ? 'bg-indigo-600 text-white' : 'bg-transparent text-sm'}`}
                                    onClick={() => setViewMode('global')}
                                >
                                    All Chat
                                </button>
                            </div>
                            <div className="text-xs text-muted-foreground">AI Assist</div>
                        </div>

                        <div className="flex-1 overflow-auto mb-3 space-y-3">
                            {viewMode === 'assistant' ? (
                                <>
                                    {displayedMessages.length === 0 && (
                                        <div className="text-sm text-muted-foreground">No messages yet. Ask the assistant.</div>
                                    )}
                                    {displayedMessages.map((m) => (
                                        <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`${m.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'} rounded-lg px-3 py-2 max-w-[80%]`}>
                                                <div className="whitespace-pre-wrap break-words text-sm">{m.text}</div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {(!globalMessages || globalMessages.length === 0) && (
                                        <div className="text-sm text-muted-foreground">No chat messages from users yet.</div>
                                    )}
                                    {globalMessages && globalMessages.map((g) => {
                                        const isYou = false; // assistant panel is read-only for global messages
                                        const isEmergency = g.type === 'emergency';
                                        return (
                                            <div key={g.id} className="mb-3 last:mb-0">
                                                <div className={`flex items-center gap-2 mb-1 ${isYou ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isYou ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                        {isYou ? '💬 You' : `👤 ${g.userName}`}
                                                    </div>
                                                    {isEmergency && (
                                                        <span className="bg-destructive/90 text-destructive-foreground text-xs px-3 py-1 rounded-full animate-pulse">
                                                            🚨 Emergency
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`flex items-start gap-2 ${isYou ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium shadow-sm ${isEmergency ? 'bg-destructive text-destructive-foreground' : 'bg-muted'}`}>
                                                        {g.userName ? g.userName[0].toUpperCase() : 'U'}
                                                    </div>
                                                    <div className={`max-w-[80%]`}>
                                                        <div className={`rounded-lg px-4 py-2 shadow-sm ${isEmergency ? 'bg-destructive text-destructive-foreground' : 'bg-card'}`}>
                                                            <p className="text-sm whitespace-pre-wrap break-words">{g.content}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                            <span>{new Date(g.timestamp).toLocaleTimeString()}</span>
                                                            <button className="ml-2 text-xs text-indigo-600" onClick={() => setInput(String(g.content))}>Use</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') sendPrompt(input); }}
                                placeholder={loading ? 'Thinking...' : 'Ask the assistant...'}
                                className="flex-1 px-3 py-2 border rounded"
                            />
                            <Button onClick={() => sendPrompt(input)} disabled={loading || !input.trim()}>
                                Send
                            </Button>
                        </div>
                    </div>
                </ResizablePanel>
            )}
        </>
    );
};

export default AIAssist;
