import { useState, useEffect } from "react";
import { TrafficSimulation } from "@/components/TrafficSimulation";
import { MessageBar } from "@/components/MessageBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmergencyButton } from "@/components/EmergencyButton";
import ResizablePanel from "@/components/ResizablePanel";
import AIAssist from '@/components/AIAssist';

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'emergency' | 'normal';
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(30);
  const [userName, setUserName] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (user) {
      const websocket = new WebSocket('ws://localhost:3001');

      websocket.onopen = () => {
        websocket.send(JSON.stringify({
          type: 'connect',
          userName: user.name
        }));
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'connected':
            setUser(prev => ({ ...prev!, id: data.userId }));
            setMessages(data.messages);
            break;
          case 'userList':
            // data.users = [{ userId, userName }, ...]
            setConnectedUsers((data.users || []).map((u: { userId: string; userName: string }) => ({ id: u.userId, name: u.userName })));
            break;
          case 'newMessage':
            setMessages(prev => [...prev, data.message]);
            break;
          case 'emergency':
            setMessages(prev => [...prev, data.message]);
            setIsEmergencyActive(true);
            setEmergencyCountdown(30);
            break;
          case 'trafficUpdate':
            // Handle traffic update if needed
            break;
        }
      };

      setWs(websocket);

      return () => {
        websocket.close();
      };
    }
  }, [user]);

  useEffect(() => {
    if (isEmergencyActive && emergencyCountdown > 0) {
      const timer = setInterval(() => {
        setEmergencyCountdown(prev => prev - 1);
      }, 1000);

      if (emergencyCountdown === 0) {
        setIsEmergencyActive(false);
      }

      return () => clearInterval(timer);
    }
  }, [isEmergencyActive, emergencyCountdown]);

  const handleConnect = () => {
    if (userName.trim()) {
      setUser({ id: '', name: userName.trim() });
    }
  };

  const handleSendMessage = (content: string) => {
    if (ws && user && content.trim()) {
      ws.send(JSON.stringify({
        type: 'message',
        userId: user.id,
        content: content.trim()
      }));
      setNewMessage("");

      // Add local message immediately for better UX
      const newMsg = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        content: content.trim(),
        timestamp: new Date(),
        type: 'normal' as const
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const handleEmergency = () => {
    if (ws && user) {
      ws.send(JSON.stringify({
        type: 'emergency',
        userId: user.id
      }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 shadow-xl border-2 border-primary/10">
          <h2 className="text-2xl font-bold mb-4 text-center text-primary">Join Traffic Communication</h2>
          <p className="text-muted-foreground text-sm mb-6 text-center">
            Enter your name to join the traffic communication system
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                className="text-lg"
                autoFocus
              />
              {userName.trim() === "" && (
                <p className="text-xs text-muted-foreground">
                  Please enter your name to continue
                </p>
              )}
            </div>
            <Button
              onClick={handleConnect}
              className="w-full text-lg py-6"
              disabled={userName.trim() === ""}
            >
              Connect to Chat
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Messages (now movable/resizable) */}
        <ResizablePanel initialWidth={380} initialHeight={600} initialX={12} initialY={12}>
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                Connected as: <span className="font-bold text-primary">{user.name}</span>
              </div>
            </div>
            <EmergencyButton
              onActivate={handleEmergency}
              isActive={isEmergencyActive}
              countdown={emergencyCountdown}
            />
          </div>
          {/* Connected users list */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto">
            {connectedUsers.length === 0 ? (
              <div className="text-xs text-muted-foreground">No users connected</div>
            ) : (
              connectedUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2 mr-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {u.name ? u.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-sm">{u.name}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg, index) => {
              const isFirstMessageFromUser = index === 0 || messages[index - 1].userId !== msg.userId;
              const isYou = msg.userId === user.id;

              return (
                <div key={msg.id} className="mb-4 last:mb-0">
                  {/* Message group header */}
                  {isFirstMessageFromUser && (
                    <div className={`flex items-center gap-2 mb-1 ${isYou ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${isYou ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                        {isYou ? '💬 You' : `👤 ${msg.userName}`}
                      </div>
                      {msg.type === 'emergency' && (
                        <span className="bg-destructive/90 text-destructive-foreground text-xs px-3 py-1 rounded-full animate-pulse">
                          🚨 Emergency Alert
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message bubble with avatar */}
                  <div className={`flex items-start gap-2 group ${isYou ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium shadow-sm ${msg.type === 'emergency'
                        ? 'bg-destructive text-destructive-foreground'
                        : isYou
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                        }`}
                    >
                      {msg.userName[0].toUpperCase()}
                    </div>
                    <div className={`max-w-[70%] ${isYou ? 'text-right' : 'text-left'}`}>
                      <div className={`rounded-lg px-4 py-2 shadow-sm ${msg.type === 'emergency'
                        ? 'bg-destructive text-destructive-foreground'
                        : isYou
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${isYou ? 'justify-end' : 'justify-start'
                        }`}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        {msg.type === 'emergency' && <span>• Emergency Message</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(newMessage)}
                className="flex-1"
              />
              <Button onClick={() => handleSendMessage(newMessage)}>
                Send
              </Button>
            </div>
          </div>
        </div>
      </ResizablePanel>

      {/* Right side - Traffic Simulation */}
      <div className="flex-1 relative">
        <TrafficSimulation />
      </div>
      {/* AI assistant floating icon/panel */}
      <AIAssist globalMessages={messages} />
    </div>
  );
}

export default Index;
