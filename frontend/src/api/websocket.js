import { io } from 'socket.io-client';

/**
 * WebSocket客户端管理类
 * 负责与后端服务器的实时通信
 */
class WebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.eventHandlers = new Map();
    }

    /**
     * 连接到服务器
     * @param {string} serverUrl - 服务器地址
     * @returns {Promise} 连接Promise
     */
    connect(serverUrl = 'http://localhost:3001') {
        return new Promise((resolve, reject) => {
            try {
                this.socket = io(serverUrl, {
                    transports: ['websocket', 'polling']
                });

                this.socket.on('connect', () => {
                    console.log('已连接到服务器');
                    this.isConnected = true;
                    resolve();
                });

                this.socket.on('disconnect', () => {
                    console.log('与服务器断开连接');
                    this.isConnected = false;
                });

                this.socket.on('connect_error', (error) => {
                    console.error('连接错误:', error);
                    this.isConnected = false;
                    reject(error);
                });

                // 设置通用事件处理
                this.setupEventHandlers();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 设置通用事件处理器
     */
    setupEventHandlers() {
        this.socket.on('error', (data) => {
            console.error('服务器错误:', data.message);
            this.emit('error', data);
        });

        this.socket.on('gameCreated', (data) => {
            console.log('游戏创建成功:', data);
            this.emit('gameCreated', data);
        });

        this.socket.on('gameJoined', (data) => {
            console.log('加入游戏成功:', data);
            this.emit('gameJoined', data);
        });

        this.socket.on('gameUpdate', (data) => {
            console.log('游戏状态更新:', data);
            this.emit('gameUpdate', data);
        });

        this.socket.on('piecePlace', (data) => {
            console.log('毒药放置结果:', data);
            this.emit('piecePlace', data);
        });

        this.socket.on('moveResult', (data) => {
            console.log('移动结果:', data);
            this.emit('moveResult', data);
        });

        this.socket.on('playerLeft', (data) => {
            console.log('玩家离开:', data);
            this.emit('playerLeft', data);
        });
    }

    /**
     * 创建游戏房间
     * @param {string} playerName - 玩家名称
     */
    createGame(playerName) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }
        this.socket.emit('createGame', { playerName });
    }

    /**
     * 加入游戏房间
     * @param {string} gameId - 游戏房间ID
     * @param {string} playerName - 玩家名称
     */
    joinGame(gameId, playerName) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }
        this.socket.emit('joinGame', { gameId, playerName });
    }

    /**
     * 放置毒药
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    placePiece(x, y) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }
        this.socket.emit('placePiece', { x, y });
    }

    /**
     * 进行游戏移动
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    makeMove(x, y) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }
        this.socket.emit('makeMove', { x, y });
    }

    /**
     * 获取游戏信息
     */
    getGameInfo() {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }
        this.socket.emit('getGameInfo');
    }

    /**
     * 注册事件处理器
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    /**
     * 移除事件处理器
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`事件处理器错误 (${event}):`, error);
                }
            });
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }
}

// 创建单例实例
const wsClient = new WebSocketClient();

export default wsClient;