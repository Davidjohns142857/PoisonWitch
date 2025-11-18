import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';
import Board from '../components/Board';
import GameInfo from '../components/GameInfo';
import wsClient from '../api/websocket';
import './GameRoom.css';

/**
 * 游戏房间主视图
 * 整合棋盘和信息组件，管理对局状态
 */
const GameRoom = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { gameState, placePiece, makeMove, connect } = useGameStore();

    const [myPoisonPosition, setMyPoisonPosition] = useState(null);
    const [showCopySuccess, setShowCopySuccess] = useState(false);

    // 确保已连接到服务器
    useEffect(() => {
        if (!gameState.isConnected) {
            connect();
        }
    }, [gameState.isConnected, connect]);

    // 监听游戏事件
    useEffect(() => {
        const handlePiecePlace = (data) => {
            if (data.success) {
                // 记录我放置的毒药位置（仅客户端知道）
                console.log('毒药放置成功');
            }
        };

        const handleMoveResult = (data) => {
            if (data.gameOver) {
                setTimeout(() => {
                    if (window.confirm('游戏结束！是否返回主页？')) {
                        navigate('/');
                    }
                }, 2000);
            }
        };

        const handlePlayerLeft = (data) => {
            alert('对方玩家离开了游戏');
            setTimeout(() => {
                navigate('/');
            }, 1000);
        };

        wsClient.on('piecePlace', handlePiecePlace);
        wsClient.on('moveResult', handleMoveResult);
        wsClient.on('playerLeft', handlePlayerLeft);

        return () => {
            wsClient.off('piecePlace', handlePiecePlace);
            wsClient.off('moveResult', handleMoveResult);
            wsClient.off('playerLeft', handlePlayerLeft);
        };
    }, [navigate]);

    /**
     * 处理格子点击
     */
    const handleCellClick = (x, y) => {
        const { gameInfo } = gameState;
        if (!gameInfo) return;

        // 放置毒药阶段
        if (gameInfo.state === 'placing_pieces') {
            const myPlayer = gameInfo.players.find(p => p.id === wsClient.socket?.id);
            if (myPlayer && !myPlayer.poisonPlaced) {
                placePiece(x, y);
                setMyPoisonPosition({ x, y });
            }
        }
        // 游戏进行阶段
        else if (gameInfo.state === 'playing') {
            if (gameInfo.currentPlayer === wsClient.socket?.id) {
                makeMove(x, y);
            }
        }
    };

    /**
     * 复制游戏ID到剪贴板
     */
    const handleCopyGameId = () => {
        const idToCopy = gameState.gameId || gameId;
        if (idToCopy) {
            navigator.clipboard.writeText(idToCopy).then(() => {
                setShowCopySuccess(true);
                setTimeout(() => setShowCopySuccess(false), 2000);
            }).catch(() => {
                alert(`游戏ID: ${idToCopy}`);
            });
        }
    };

    /**
     * 返回主页
     */
    const handleBackHome = () => {
        if (window.confirm('确定要离开游戏吗？')) {
            navigate('/');
        }
    };

    // 如果没有游戏信息，显示加载状态
    if (!gameState.gameInfo) {
        return (
            <div className="game-room-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>加载游戏中...</p>
                    {gameState.error && (
                        <div className="error-message">
                            <p>{gameState.error}</p>
                            <button onClick={handleBackHome} className="btn btn-secondary">
                                返回主页
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const { gameInfo, playerNumber } = gameState;
    const playerId = wsClient.socket?.id;

    return (
        <div className="game-room-container">
            <div className="game-room-header">
                <div className="game-id-section">
                    <h2>游戏房间</h2>
                    {gameInfo.state === 'waiting_for_players' && (
                        <div className="game-id-display">
                            <span className="label">游戏ID:</span>
                            <code className="game-id">{gameState.gameId || gameId}</code>
                            <button
                                onClick={handleCopyGameId}
                                className="btn-copy"
                                title="复制游戏ID"
                            >
                                📋 {showCopySuccess ? '已复制!' : '复制'}
                            </button>
                        </div>
                    )}
                    {gameInfo.state === 'waiting_for_players' && (
                        <p className="wait-message">
                            等待对手加入... 分享游戏ID给你的朋友！
                        </p>
                    )}
                </div>
                <button onClick={handleBackHome} className="btn btn-back">
                    返回主页
                </button>
            </div>

            <div className="game-room-content">
                <div className="board-section">
                    <Board
                        board={gameInfo.board}
                        gameState={gameInfo.state}
                        currentPlayer={gameInfo.currentPlayer}
                        playerId={playerId}
                        myPoisonPosition={myPoisonPosition}
                        onCellClick={handleCellClick}
                        size={5}
                    />
                </div>

                <div className="info-section">
                    <GameInfo
                        gameInfo={gameInfo}
                        playerName={gameState.playerName}
                        playerNumber={playerNumber}
                        playerId={playerId}
                    />
                </div>
            </div>

            {gameState.error && (
                <div className="error-toast">
                    ⚠️ {gameState.error}
                </div>
            )}
        </div>
    );
};

export default GameRoom;
