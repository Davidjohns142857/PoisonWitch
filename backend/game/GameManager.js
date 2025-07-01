const { Game } = require('./Game');
const { v4: uuidv4 } = require('uuid');

/**
 * 游戏房间管理器，负责管理所有活跃的游戏实例
 */
class GameManager {
    constructor() {
        this.games = new Map(); // gameId -> Game实例
        this.playerGameMap = new Map(); // playerId -> gameId
    }

    /**
     * 创建新游戏房间
     * @param {string} playerId - 创建者ID
     * @param {string} playerName - 创建者名称
     * @returns {Object} 创建结果
     */
    createGame(playerId, playerName) {
        // 检查玩家是否已在其他游戏中
        if (this.playerGameMap.has(playerId)) {
            const existingGameId = this.playerGameMap.get(playerId);
            return { 
                success: false, 
                message: '玩家已在游戏中',
                gameId: existingGameId 
            };
        }

        const gameId = uuidv4();
        const game = new Game(gameId);
        
        // 创建者自动加入游戏
        const joinResult = game.addPlayer(playerId, playerName);
        if (!joinResult.success) {
            return joinResult;
        }

        this.games.set(gameId, game);
        this.playerGameMap.set(playerId, gameId);

        return {
            success: true,
            gameId,
            playerNumber: joinResult.playerNumber,
            message: '游戏房间创建成功'
        };
    }

    /**
     * 加入游戏房间
     * @param {string} gameId - 游戏房间ID
     * @param {string} playerId - 玩家ID
     * @param {string} playerName - 玩家名称
     * @returns {Object} 加入结果
     */
    joinGame(gameId, playerId, playerName) {
        // 检查玩家是否已在其他游戏中
        if (this.playerGameMap.has(playerId)) {
            const existingGameId = this.playerGameMap.get(playerId);
            if (existingGameId !== gameId) {
                return { 
                    success: false, 
                    message: '玩家已在其他游戏中',
                    gameId: existingGameId 
                };
            }
        }

        const game = this.games.get(gameId);
        if (!game) {
            return { success: false, message: '游戏房间不存在' };
        }

        const joinResult = game.addPlayer(playerId, playerName);
        if (joinResult.success) {
            this.playerGameMap.set(playerId, gameId);
        }

        return { ...joinResult, gameId };
    }

    /**
     * 获取游戏实例
     * @param {string} gameId - 游戏房间ID
     * @returns {Game|null} 游戏实例
     */
    getGame(gameId) {
        return this.games.get(gameId) || null;
    }

    /**
     * 根据玩家ID获取游戏实例
     * @param {string} playerId - 玩家ID
     * @returns {Game|null} 游戏实例
     */
    getGameByPlayer(playerId) {
        const gameId = this.playerGameMap.get(playerId);
        return gameId ? this.games.get(gameId) : null;
    }

    /**
     * 玩家离开游戏
     * @param {string} playerId - 玩家ID
     * @returns {Object} 离开结果
     */
    leaveGame(playerId) {
        const gameId = this.playerGameMap.get(playerId);
        if (!gameId) {
            return { success: false, message: '玩家不在任何游戏中' };
        }

        const game = this.games.get(gameId);
        if (game) {
            game.removePlayer(playerId);
            
            // 如果游戏没有玩家了，删除游戏
            if (game.players.size === 0) {
                this.games.delete(gameId);
            }
        }

        this.playerGameMap.delete(playerId);
        return { success: true, gameId, message: '已离开游戏' };
    }

    /**
     * 获取活跃游戏数量
     * @returns {number} 活跃游戏数量
     */
    getActiveGamesCount() {
        return this.games.size;
    }

    /**
     * 清理空的或过期的游戏房间
     */
    cleanupGames() {
        const now = new Date();
        const maxAge = 2 * 60 * 60 * 1000; // 2小时

        for (const [gameId, game] of this.games) {
            const age = now - game.createdAt;
            if (game.players.size === 0 || age > maxAge) {
                // 清理玩家映射
                for (const playerId of game.players.keys()) {
                    this.playerGameMap.delete(playerId);
                }
                this.games.delete(gameId);
            }
        }
    }
}

// 创建单例实例
const gameManager = new GameManager();

// 定期清理游戏房间
setInterval(() => {
    gameManager.cleanupGames();
}, 30 * 60 * 1000); // 每30分钟清理一次

module.exports = gameManager;