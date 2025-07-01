const gameManager = require('../game/GameManager');

/**
 * 设置Socket.IO事件处理器
 * @param {Object} io - Socket.IO服务器实例
 */
function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`玩家连接: ${socket.id}`);

        /**
         * 处理创建游戏事件
         */
        socket.on('createGame', (data) => {
            try {
                const { playerName } = data;
                if (!playerName || playerName.trim() === '') {
                    socket.emit('error', { message: '玩家名称不能为空' });
                    return;
                }

                const result = gameManager.createGame(socket.id, playerName.trim());
                
                if (result.success) {
                    socket.join(result.gameId);
                    const game = gameManager.getGame(result.gameId);
                    
                    socket.emit('gameCreated', {
                        gameId: result.gameId,
                        playerNumber: result.playerNumber,
                        gameInfo: game.getGameInfo()
                    });
                    
                    // 通知房间内所有玩家
                    io.to(result.gameId).emit('gameUpdate', game.getGameInfo());
                } else {
                    socket.emit('error', { message: result.message });
                }
            } catch (error) {
                console.error('创建游戏错误:', error);
                socket.emit('error', { message: '创建游戏失败' });
            }
        });

        /**
         * 处理加入游戏事件
         */
        socket.on('joinGame', (data) => {
            try {
                const { gameId, playerName } = data;
                if (!gameId || !playerName || playerName.trim() === '') {
                    socket.emit('error', { message: '游戏ID和玩家名称不能为空' });
                    return;
                }

                const result = gameManager.joinGame(gameId, socket.id, playerName.trim());
                
                if (result.success) {
                    socket.join(gameId);
                    const game = gameManager.getGame(gameId);
                    
                    socket.emit('gameJoined', {
                        gameId,
                        playerNumber: result.playerNumber,
                        gameInfo: game.getGameInfo()
                    });
                    
                    // 通知房间内所有玩家
                    io.to(gameId).emit('gameUpdate', game.getGameInfo());
                } else {
                    socket.emit('error', { message: result.message });
                }
            } catch (error) {
                console.error('加入游戏错误:', error);
                socket.emit('error', { message: '加入游戏失败' });
            }
        });

        /**
         * 处理放置毒药事件
         */
        socket.on('placePiece', (data) => {
            try {
                const { x, y } = data;
                if (typeof x !== 'number' || typeof y !== 'number') {
                    socket.emit('error', { message: '无效的坐标' });
                    return;
                }

                const game = gameManager.getGameByPlayer(socket.id);
                if (!game) {
                    socket.emit('error', { message: '玩家不在任何游戏中' });
                    return;
                }

                const result = game.placePiece(socket.id, x, y);
                
                if (result.success) {
                    socket.emit('piecePlace', result);
                    // 通知房间内所有玩家游戏状态更新
                    io.to(game.gameId).emit('gameUpdate', game.getGameInfo());
                } else {
                    socket.emit('error', { message: result.message });
                }
            } catch (error) {
                console.error('放置毒药错误:', error);
                socket.emit('error', { message: '放置毒药失败' });
            }
        });

        /**
         * 处理游戏移动事件
         */
        socket.on('makeMove', (data) => {
            try {
                const { x, y } = data;
                if (typeof x !== 'number' || typeof y !== 'number') {
                    socket.emit('error', { message: '无效的坐标' });
                    return;
                }

                const game = gameManager.getGameByPlayer(socket.id);
                if (!game) {
                    socket.emit('error', { message: '玩家不在任何游戏中' });
                    return;
                }

                const result = game.makeMove(socket.id, x, y);
                
                if (result.success) {
                    // 通知房间内所有玩家移动结果
                    io.to(game.gameId).emit('moveResult', result);
                    io.to(game.gameId).emit('gameUpdate', game.getGameInfo());
                } else {
                    socket.emit('error', { message: result.message });
                }
            } catch (error) {
                console.error('游戏移动错误:', error);
                socket.emit('error', { message: '游戏移动失败' });
            }
        });

        /**
         * 处理获取游戏信息事件
         */
        socket.on('getGameInfo', () => {
            try {
                const game = gameManager.getGameByPlayer(socket.id);
                if (game) {
                    socket.emit('gameInfo', game.getGameInfo());
                } else {
                    socket.emit('error', { message: '玩家不在任何游戏中' });
                }
            } catch (error) {
                console.error('获取游戏信息错误:', error);
                socket.emit('error', { message: '获取游戏信息失败' });
            }
        });

        /**
         * 处理玩家断开连接
         */
        socket.on('disconnect', () => {
            try {
                console.log(`玩家断开连接: ${socket.id}`);
                const result = gameManager.leaveGame(socket.id);
                
                if (result.success && result.gameId) {
                    const game = gameManager.getGame(result.gameId);
                    if (game) {
                        // 通知房间内其他玩家
                        io.to(result.gameId).emit('playerLeft', {
                            playerId: socket.id,
                            gameInfo: game.getGameInfo()
                        });
                    }
                }
            } catch (error) {
                console.error('处理断开连接错误:', error);
            }
        });
    });
}

module.exports = { setupSocketHandlers };