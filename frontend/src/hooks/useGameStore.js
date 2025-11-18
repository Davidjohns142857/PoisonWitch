import { useState, useCallback, useEffect } from 'react';
import wsClient from '../api/websocket';

/**
 * 游戏状态管理Hook
 * 集中管理游戏ID、玩家状态、棋盘数据等
 */
export const useGameStore = () => {
    const [gameState, setGameState] = useState({
        gameId: null,
        playerNumber: null,
        playerName: '',
        gameInfo: null,
        isConnected: false,
        error: null,
        isLoading: false
    });

    /**
     * 连接到服务器
     */
    const connect = useCallback(async () => {
        try {
            setGameState(prev => ({ ...prev, isLoading: true, error: null }));
            await wsClient.connect();
            setGameState(prev => ({ ...prev, isConnected: true, isLoading: false }));
        } catch (error) {
            setGameState(prev => ({ 
                ...prev, 
                isConnected: false, 
                isLoading: false,
                error: '连接服务器失败: ' + error.message 
            }));
        }
    }, []);

    /**
     * 创建游戏
     * @param {string} playerName - 玩家名称
     */
    const createGame = useCallback((playerName) => {
        try {
            setGameState(prev => ({ ...prev, isLoading: true, error: null, playerName }));
            wsClient.createGame(playerName);
        } catch (error) {
            setGameState(prev => ({ 
                ...prev, 
                isLoading: false,
                error: '创建游戏失败: ' + error.message 
            }));
        }
    }, []);

    /**
     * 加入游戏
     * @param {string} gameId - 游戏ID
     * @param {string} playerName - 玩家名称
     */
    const joinGame = useCallback((gameId, playerName) => {
        try {
            setGameState(prev => ({ ...prev, isLoading: true, error: null, playerName }));
            wsClient.joinGame(gameId, playerName);
        } catch (error) {
            setGameState(prev => ({ 
                ...prev, 
                isLoading: false,
                error: '加入游戏失败: ' + error.message 
            }));
        }
    }, []);

    /**
     * 放置毒药
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    const placePiece = useCallback((x, y) => {
        try {
            wsClient.placePiece(x, y);
        } catch (error) {
            setGameState(prev => ({ 
                ...prev, 
                error: '放置毒药失败: ' + error.message 
            }));
        }
    }, []);

    /**
     * 进行游戏移动
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    const makeMove = useCallback((x, y) => {
        try {
            wsClient.makeMove(x, y);
        } catch (error) {
            setGameState(prev => ({ 
                ...prev, 
                error: '移动失败: ' + error.message 
            }));
        }
    }, []);

    /**
     * 清除错误信息
     */
    const clearError = useCallback(() => {
        setGameState(prev => ({ ...prev, error: null }));
    }, []);

    /**
     * 重置游戏状态
     */
    const resetGame = useCallback(() => {
        setGameState({
            gameId: null,
            playerNumber: null,
            playerName: '',
            gameInfo: null,
            isConnected: false,
            error: null,
            isLoading: false
        });
        wsClient.disconnect();
    }, []);

    // 设置WebSocket事件监听器
    useEffect(() => {
        const handleGameCreated = (data) => {
            setGameState(prev => ({
                ...prev,
                gameId: data.gameId,
                playerNumber: data.playerNumber,
                gameInfo: data.gameInfo,
                isLoading: false
            }));
        };

        const handleGameJoined = (data) => {
            setGameState(prev => ({
                ...prev,
                gameId: data.gameId,
                playerNumber: data.playerNumber,
                gameInfo: data.gameInfo,
                isLoading: false
            }));
        };

        const handleGameUpdate = (gameInfo) => {
            setGameState(prev => ({ ...prev, gameInfo }));
        };

        const handleError = (data) => {
            setGameState(prev => ({ 
                ...prev, 
                error: data.message,
                isLoading: false 
            }));
        };

        const handlePlayerLeft = (data) => {
            setGameState(prev => ({ ...prev, gameInfo: data.gameInfo }));
        };

        // 注册事件监听器
        wsClient.on('gameCreated', handleGameCreated);
        wsClient.on('gameJoined', handleGameJoined);
        wsClient.on('gameUpdate', handleGameUpdate);
        wsClient.on('error', handleError);
        wsClient.on('playerLeft', handlePlayerLeft);

        // 清理函数
        return () => {
            wsClient.off('gameCreated', handleGameCreated);
            wsClient.off('gameJoined', handleGameJoined);
            wsClient.off('gameUpdate', handleGameUpdate);
            wsClient.off('error', handleError);
            wsClient.off('playerLeft', handlePlayerLeft);
        };
    }, []);

    return {
        gameState,
        connect,
        createGame,
        joinGame,
        placePiece,
        makeMove,
        clearError,
        resetGame
    };
};