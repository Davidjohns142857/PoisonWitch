const { v4: uuidv4 } = require('uuid');

/**
 * 游戏状态枚举
 */
const GameState = {
    WAITING_FOR_PLAYERS: 'waiting_for_players',
    PLACING_PIECES: 'placing_pieces',
    PLAYING: 'playing',
    FINISHED: 'finished'
};

/**
 * 格子状态枚举
 */
const CellState = {
    EMPTY: 'empty',
    BREAD: 'bread',
    POISON: 'poison',
    REVEALED: 'revealed'
};

/**
 * 单个游戏房间类，处理经典模式的游戏逻辑
 */
class Game {
    /**
     * 创建新的游戏实例
     * @param {string} gameId - 游戏房间ID
     */
    constructor(gameId) {
        this.gameId = gameId || uuidv4();
        this.players = new Map(); // playerId -> playerInfo
        this.board = this.initializeBoard();
        this.state = GameState.WAITING_FOR_PLAYERS;
        this.currentPlayer = null;
        this.winner = null;
        this.poisonPositions = new Map(); // playerId -> {x, y}
        this.revealedCells = new Set(); // "x,y" 格式的已揭示格子
        this.createdAt = new Date();
    }

    /**
     * 初始化5x5棋盘
     * @returns {Array} 二维数组表示的棋盘
     */
    initializeBoard() {
        const board = [];
        for (let i = 0; i < 5; i++) {
            board[i] = [];
            for (let j = 0; j < 5; j++) {
                board[i][j] = CellState.EMPTY;
            }
        }
        return board;
    }

    /**
     * 玩家加入游戏
     * @param {string} playerId - 玩家ID
     * @param {string} playerName - 玩家名称
     * @returns {Object} 加入结果
     */
    addPlayer(playerId, playerName) {
        if (this.players.size >= 2) {
            return { success: false, message: '游戏房间已满' };
        }

        if (this.players.has(playerId)) {
            return { success: false, message: '玩家已在游戏中' };
        }

        const playerNumber = this.players.size + 1;
        this.players.set(playerId, {
            id: playerId,
            name: playerName,
            number: playerNumber,
            ready: false,
            poisonPlaced: false
        });

        // 如果两个玩家都加入，进入放置毒药阶段
        if (this.players.size === 2) {
            this.state = GameState.PLACING_PIECES;
        }

        return { 
            success: true, 
            playerNumber,
            gameState: this.state,
            message: `玩家${playerNumber}加入成功` 
        };
    }

    /**
     * 玩家放置毒药
     * @param {string} playerId - 玩家ID
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object} 放置结果
     */
    placePiece(playerId, x, y) {
        if (this.state !== GameState.PLACING_PIECES) {
            return { success: false, message: '当前不是放置阶段' };
        }

        if (!this.players.has(playerId)) {
            return { success: false, message: '玩家不在游戏中' };
        }

        if (!this.isValidPosition(x, y)) {
            return { success: false, message: '无效的位置' };
        }

        const player = this.players.get(playerId);
        if (player.poisonPlaced) {
            return { success: false, message: '毒药已放置' };
        }

        // 检查位置是否已被占用
        for (const [pid, pos] of this.poisonPositions) {
            if (pos.x === x && pos.y === y) {
                return { success: false, message: '位置已被占用' };
            }
        }

        // 放置毒药
        this.poisonPositions.set(playerId, { x, y });
        player.poisonPlaced = true;

        // 检查是否所有玩家都放置了毒药
        const allPlaced = Array.from(this.players.values()).every(p => p.poisonPlaced);
        if (allPlaced) {
            this.state = GameState.PLAYING;
            this.currentPlayer = Array.from(this.players.keys())[0]; // 第一个玩家先开始
        }

        return { 
            success: true, 
            gameState: this.state,
            currentPlayer: this.currentPlayer,
            message: '毒药放置成功' 
        };
    }

    /**
     * 玩家进行移动（点击格子）
     * @param {string} playerId - 玩家ID
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object} 移动结果
     */
    makeMove(playerId, x, y) {
        if (this.state !== GameState.PLAYING) {
            return { success: false, message: '游戏未开始' };
        }

        if (this.currentPlayer !== playerId) {
            return { success: false, message: '不是你的回合' };
        }

        if (!this.isValidPosition(x, y)) {
            return { success: false, message: '无效的位置' };
        }

        const cellKey = `${x},${y}`;
        if (this.revealedCells.has(cellKey)) {
            return { success: false, message: '该位置已被选择' };
        }

        // 标记格子为已揭示
        this.revealedCells.add(cellKey);

        // 检查是否击中毒药
        let hitPoison = false;
        let hitPlayerId = null;
        for (const [pid, pos] of this.poisonPositions) {
            if (pos.x === x && pos.y === y) {
                hitPoison = true;
                hitPlayerId = pid;
                break;
            }
        }

        let result;
        if (hitPoison) {
            // 击中毒药，游戏结束
            this.state = GameState.FINISHED;
            this.winner = hitPlayerId; // 被击中毒药的玩家获胜
            this.board[x][y] = CellState.POISON;
            result = {
                success: true,
                hit: 'poison',
                gameOver: true,
                winner: this.winner,
                winnerName: this.players.get(this.winner).name,
                message: `${this.players.get(playerId).name} 中毒了！${this.players.get(this.winner).name} 获胜！`
            };
        } else {
            // 击中面包，继续游戏
            this.board[x][y] = CellState.BREAD;
            this.switchPlayer();
            result = {
                success: true,
                hit: 'bread',
                gameOver: false,
                currentPlayer: this.currentPlayer,
                message: '发现面包，继续游戏'
            };
        }

        result.position = { x, y };
        result.gameState = this.state;
        return result;
    }

    /**
     * 切换当前玩家
     */
    switchPlayer() {
        const playerIds = Array.from(this.players.keys());
        const currentIndex = playerIds.indexOf(this.currentPlayer);
        this.currentPlayer = playerIds[(currentIndex + 1) % playerIds.length];
    }

    /**
     * 检查位置是否有效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 位置是否有效
     */
    isValidPosition(x, y) {
        return x >= 0 && x < 5 && y >= 0 && y < 5;
    }

    /**
     * 获取游戏状态信息
     * @returns {Object} 游戏状态
     */
    getGameInfo() {
        return {
            gameId: this.gameId,
            state: this.state,
            players: Array.from(this.players.values()),
            currentPlayer: this.currentPlayer,
            winner: this.winner,
            board: this.getPublicBoard(),
            revealedCells: Array.from(this.revealedCells)
        };
    }

    /**
     * 获取公开的棋盘状态（隐藏未揭示的毒药）
     * @returns {Array} 公开棋盘状态
     */
    getPublicBoard() {
        const publicBoard = [];
        for (let i = 0; i < 5; i++) {
            publicBoard[i] = [];
            for (let j = 0; j < 5; j++) {
                const cellKey = `${i},${j}`;
                if (this.revealedCells.has(cellKey)) {
                    publicBoard[i][j] = this.board[i][j];
                } else {
                    publicBoard[i][j] = CellState.EMPTY;
                }
            }
        }
        return publicBoard;
    }

    /**
     * 移除玩家
     * @param {string} playerId - 玩家ID
     */
    removePlayer(playerId) {
        this.players.delete(playerId);
        this.poisonPositions.delete(playerId);
        
        if (this.players.size === 0) {
            this.state = GameState.FINISHED;
        }
    }
}

module.exports = { Game, GameState, CellState };