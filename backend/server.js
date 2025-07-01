const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const socketHandler = require('./network/socketHandler');

/**
 * 初始化并启动女巫毒药游戏服务器
 * 设置Express服务器、Socket.IO和CORS
 */
function initializeServer() {
    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    // 中间件配置
    app.use(cors());
    app.use(express.json());

    // 健康检查端点
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', message: '女巫毒药服务器运行正常' });
    });

    // 设置Socket.IO事件处理
    socketHandler.setupSocketHandlers(io);

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`女巫毒药服务器启动在端口 ${PORT}`);
    });

    return { app, server, io };
}

// 启动服务器
if (require.main === module) {
    initializeServer();
}

module.exports = { initializeServer };