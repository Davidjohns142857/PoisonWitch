import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';
import './Home.css';

/**
 * 游戏主页组件
 * 提供创建游戏和加入游戏的入口
 */
const Home = () => {
    const navigate = useNavigate();
    const { gameState, connect, createGame, joinGame } = useGameStore();

    const [playerName, setPlayerName] = useState('');
    const [gameIdToJoin, setGameIdToJoin] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // 组件加载时连接到服务器
    useEffect(() => {
        if (!gameState.isConnected) {
            connect();
        }
    }, [gameState.isConnected, connect]);

    // 监听游戏创建/加入成功，跳转到游戏房间
    useEffect(() => {
        if (gameState.gameId && (isCreating || isJoining)) {
            navigate(`/game/${gameState.gameId}`);
        }
    }, [gameState.gameId, isCreating, isJoining, navigate]);

    /**
     * 处理创建游戏
     */
    const handleCreateGame = (e) => {
        e.preventDefault();
        if (!playerName.trim()) {
            alert('请输入玩家名称');
            return;
        }
        if (!gameState.isConnected) {
            alert('未连接到服务器，请稍后再试');
            return;
        }
        setIsCreating(true);
        createGame(playerName.trim());
    };

    /**
     * 处理加入游戏
     */
    const handleJoinGame = (e) => {
        e.preventDefault();
        if (!playerName.trim()) {
            alert('请输入玩家名称');
            return;
        }
        if (!gameIdToJoin.trim()) {
            alert('请输入游戏ID');
            return;
        }
        if (!gameState.isConnected) {
            alert('未连接到服务器，请稍后再试');
            return;
        }
        setIsJoining(true);
        joinGame(gameIdToJoin.trim(), playerName.trim());
    };

    return (
        <div className="home-container">
            <div className="home-content">
                <div className="welcome-section">
                    <h2>欢迎来到女巫毒药游戏</h2>
                    <p className="game-description">
                        这是一个双人对战游戏。每位玩家在5x5的棋盘上秘密放置一个毒药，
                        然后轮流点击格子寻找对方的毒药。点击到毒药的玩家输掉游戏！
                    </p>

                    <div className="connection-status">
                        {gameState.isConnected ? (
                            <span className="status-connected">✓ 已连接到服务器</span>
                        ) : (
                            <span className="status-disconnected">
                                {gameState.isLoading ? '⏳ 连接中...' : '✗ 未连接'}
                            </span>
                        )}
                    </div>
                </div>

                {gameState.error && (
                    <div className="error-message">
                        ⚠️ {gameState.error}
                    </div>
                )}

                <div className="game-actions">
                    <div className="action-card">
                        <h3>创建新游戏</h3>
                        <form onSubmit={handleCreateGame} className="game-form">
                            <div className="form-group">
                                <label htmlFor="create-name">玩家名称</label>
                                <input
                                    id="create-name"
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="请输入你的名字"
                                    maxLength="20"
                                    disabled={!gameState.isConnected || gameState.isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!gameState.isConnected || gameState.isLoading}
                            >
                                {gameState.isLoading && isCreating ? '创建中...' : '创建游戏'}
                            </button>
                        </form>
                    </div>

                    <div className="divider">
                        <span>或</span>
                    </div>

                    <div className="action-card">
                        <h3>加入现有游戏</h3>
                        <form onSubmit={handleJoinGame} className="game-form">
                            <div className="form-group">
                                <label htmlFor="join-name">玩家名称</label>
                                <input
                                    id="join-name"
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="请输入你的名字"
                                    maxLength="20"
                                    disabled={!gameState.isConnected || gameState.isLoading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="game-id">游戏ID</label>
                                <input
                                    id="game-id"
                                    type="text"
                                    value={gameIdToJoin}
                                    onChange={(e) => setGameIdToJoin(e.target.value)}
                                    placeholder="输入好友分享的游戏ID"
                                    disabled={!gameState.isConnected || gameState.isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-secondary"
                                disabled={!gameState.isConnected || gameState.isLoading}
                            >
                                {gameState.isLoading && isJoining ? '加入中...' : '加入游戏'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="game-rules">
                    <h3>游戏规则</h3>
                    <ul>
                        <li>游戏开始前，每位玩家在5x5棋盘上选择一个位置放置毒药</li>
                        <li>毒药位置对对方保密</li>
                        <li>游戏开始后，玩家轮流点击棋盘格子</li>
                        <li>点击空格子会显示面包🍞</li>
                        <li>点击到毒药☠️的玩家失败，对方获胜</li>
                        <li>每个格子只能被点击一次</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Home;
