import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";

interface Message {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
    type: 'emergency' | 'normal';
}

interface MessageBarProps {
    userId: string;
    userName: string;
    onSendMessage: (message: string) => void;
    messages: Message[];
}

export const MessageBar = ({ userId, userName, onSendMessage, messages }: MessageBarProps) => {
    const [newMessage, setNewMessage] = useState("");

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col bg-background/95 backdrop-blur-sm shadow-xl">
            <div className="p-3 border-b">
                <h3 className="font-semibold">Traffic Communication</h3>
            </div>

            <ScrollArea className="flex-1 p-3">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex items-start gap-2 ${msg.userId === userId ? 'flex-row-reverse' : ''
                                }`}
                        >
                            <Avatar className={
                                msg.type === 'emergency'
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-primary text-primary-foreground'
                            }>
                                {msg.userName[0].toUpperCase()}
                            </Avatar>
                            <div className={`max-w-[70%] ${msg.userId === userId ? 'text-right' : 'text-left'
                                }`}>
                                <div className={`rounded-lg px-3 py-2 ${msg.type === 'emergency'
                                        ? 'bg-destructive text-destructive-foreground'
                                        : msg.userId === userId
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {msg.userName} • {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-3 border-t flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button onClick={handleSend} size="sm">
                    Send
                </Button>
            </div>
        </Card>
    );
};