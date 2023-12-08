//websocket-server.js
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.wsport;
const wss = new WebSocketServer({ port: port });

wss.on('connection', (socket) => {
    console.log('Client connected');

    // 监听消息事件
    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);

        // 发送消息给客户端
        socket.send(`Server received: ${message}`);
    });

    // 监听连接关闭事件
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});
console.log(`WebSocket server running on ws://localhost:${port}`);

export default wss