import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { getTrafficStatus, setDensity } from './speedPrediction.js';

// Store connected users and their WebSocket connections
const users = new Map();
const messages = [];

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Create HTTP server instance
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Get initial traffic status
let trafficData = getTrafficStatus();

// Helper to broadcast user list to all clients
const broadcastUserList = () => {
    const list = Array.from(users.entries()).map(([id, info]) => ({ userId: id, userName: info.userName }));
    users.forEach(({ ws: userWs }) => {
        try {
            userWs.send(JSON.stringify({ type: 'userList', users: list }));
        } catch (e) {
            // ignore send errors
        }
    });
};

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    let assignedId = null;

    // Send initial traffic data (as typed message)
    ws.send(JSON.stringify({ type: 'trafficUpdate', data: trafficData }));

    // Handle incoming messages
    ws.on('message', (data) => {
        let message;
        try {
            message = JSON.parse(data.toString());
        } catch (e) {
            return;
        }

        switch (message.type) {
            case 'connect': {
                const userId = generateId();
                assignedId = userId;
                users.set(userId, { ws, userName: message.userName });

                // Send connected confirmation with recent messages
                ws.send(JSON.stringify({ type: 'connected', userId, messages: messages.slice(-50) }));

                // Broadcast updated user list
                broadcastUserList();
                break;
            }

            case 'message': {
                const sender = users.get(message.userId);
                if (!sender) break;
                const newMessage = {
                    id: generateId(),
                    userId: message.userId,
                    userName: sender.userName,
                    content: message.content,
                    timestamp: new Date(),
                    type: message.messageType || 'normal'
                };
                messages.push(newMessage);
                // Broadcast to all connected users
                users.forEach(({ ws: userWs }) => {
                    try {
                        userWs.send(JSON.stringify({ type: 'newMessage', message: newMessage }));
                    } catch (e) { }
                });
                break;
            }

            case 'emergency': {
                const sender = users.get(message.userId);
                if (!sender) break;
                const emergencyMessage = {
                    id: generateId(),
                    userId: message.userId,
                    userName: sender.userName,
                    content: '🚨 EMERGENCY ALERT: Traffic stopped for emergency vehicle',
                    timestamp: new Date(),
                    type: 'emergency'
                };
                messages.push(emergencyMessage);

                // Update traffic data and broadcast emergency + traffic
                trafficData = getTrafficStatus();
                users.forEach(({ ws: userWs }) => {
                    try {
                        userWs.send(JSON.stringify({ type: 'emergency', message: emergencyMessage, trafficData }));
                    } catch (e) { }
                });
                break;
            }

            default:
                break;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        if (assignedId && users.has(assignedId)) {
            users.delete(assignedId);
            // Broadcast updated user list when someone disconnects
            broadcastUserList();
        }
    });

    // Update traffic data every second and push updates as typed message
    const interval = setInterval(() => {
        trafficData = getTrafficStatus();
        try {
            ws.send(JSON.stringify({ type: 'trafficUpdate', data: trafficData }));
        } catch (e) { }
    }, 1000);

    ws.on('error', () => {
        clearInterval(interval);
    });
});

// REST endpoints
app.get('/api/traffic', (req, res) => {
    res.json(trafficData);
});

app.post('/api/traffic/:direction/maxSpeed', (req, res) => {
    const { direction } = req.params;
    const { maxSpeed } = req.body;

    if (trafficData[direction]) {
        trafficData[direction].maxSpeed = maxSpeed;
        res.json({ success: true, data: trafficData[direction] });
    } else {
        res.status(400).json({ success: false, message: 'Invalid direction' });
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.post('/api/density/:direction', (req, res) => {
    const { direction } = req.params;
    const { density } = req.body;
    const ok = setDensity(direction, density);
    if (ok) {
        // refresh trafficData immediately so clients get updated values
        trafficData = getTrafficStatus();
        res.json({ success: true, direction, density });
    } else {
        res.status(400).json({ success: false, message: 'Invalid direction' });
    }
});

// Simple assistant endpoint that inspects current traffic status and returns
// a heuristic, project-aware reply. This is a lightweight, rule-based "AI"
// assistant that can be extended later to call a real ML/LLM service.
app.post('/api/assistant', (req, res) => {
    const { prompt, userId } = req.body || {};
    const status = getTrafficStatus();

    // Build a short summary and suggestions
    const lines = [];
    const suggestions = [];

    Object.entries(status).forEach(([dir, info]) => {
        const density = info.density || 0;
        const vols = info.volumes || { total: 0, first: 0, second: 0 };
        const firstETA = info.firstGroup.estimatedTimeToReach;
        const secondETA = info.secondGroup.estimatedTimeToReach;
        lines.push(`${dir}: density ${density} veh/km, total ${vols.total} vehicles; first ETA ${firstETA}s, second ETA ${secondETA}s`);

        if (density >= 40 || vols.total >= 70) {
            suggestions.push(`${dir}: high density — consider reducing inflow or rerouting traffic`);
        } else if (density >= 25) {
            suggestions.push(`${dir}: moderate density — monitor speed and volumes`);
        }
        if (info.firstGroup.hasReached && !info.secondGroup.hasReached) {
            suggestions.push(`${dir}: first group has reached; you may accelerate the second group or clear the path`);
        }
    });

    // Include the user's prompt in the reply context
    let reply = `Traffic summary:\n${lines.join('\n')}`;
    if (suggestions.length) reply += `\n\nSuggestions:\n- ${suggestions.join('\n- ')}`;
    if (prompt) reply = `User: ${prompt}\n\n` + reply;

    return res.json({ reply, suggestions, statusSnapshot: status });
});