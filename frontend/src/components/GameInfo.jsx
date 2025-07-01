import React from 'react';
import './GameInfo.css';

/**
 * 游戏信息面板组件
 * 显示回合、提示和游戏结果
 * @param {Object} props - 组件属性
 * @param {Object} props.gameInfo - 游戏信息
 * @param {string} props.playerName - 当前玩家名称
 * @param {number} props.playerNumber - 当前玩家编号
 * @param {string} props.playerId - 当前玩家ID
 */
const GameInfo = ({ gameInfo, playerName, playerNumber, playerId }) => {
    if (!gameInfo) {
        return (
            <div className="game-info">
                <div className="info-section">
                    <h3>游戏信息</h3>
                    <p>等待游戏数据...</p>
                </div>
            </div>
        );
    }

    /**
     * 获取游戏状态显示文本
     * @returns {string} 状态文本
     */
    const getGameStateText = () => {
        switch (gameInfo.state) {
            case 'waiting_for_players':
                return '等待玩家加入';
            case 'placing_pieces':
                return '放置毒药阶段';
            case 'playing':
                return '游戏进行中';
            case 'finished':
                return '游戏结束';
            default:
                return '未知状态';
        }
    };

    /**
     * 获取当前回合信息
     * @returns {string} 回合信息
     */
    const getCurrentTurnText = () => {
        if (gameInfo.state === 'playing' && gameInfo.currentPlayer) {
            const currentPlayerInfo = gameInfo.players.find(p => p.id === gameInfo.currentPlayer);
            if (currentPlayerInfo) {
                const isMyTurn = gameInfo.currentPlayer === playerId;
                return isMyTurn ? '轮到你了！' : `轮到 ${currentPlayerInfo.name}`;
            }
        }
        return '';
    };

    /**
     * 获取游戏提示信息
     * @returns {string} 提示信息
     */
    const getGameHint = () => {
        switch (gameInfo.state) {
            case 'waiting_for_players':
                return `等待另一位玩家加入。游戏ID: ${gameInfo.gameId}`;
            case 'placing_pieces':
                const myPlayer = gameInfo.players.find(p => p.id === playerId);
                if (myPlayer && !myPlayer.poisonPlaced) {
                    return '请在棋盘上选择一个位置放置你的毒药';
                } else {
                    return '等待对方放置毒药...';
                }
            case 'playing':
                const isMyTurn = gameInfo.currentPlayer === playerId;
                if (isMyTurn) {
                    return '点击棋盘格子来寻找对方的毒药！';
                } else {
                    return '等待对方行动...';
                }
            case 'finished':
                if (gameInfo.winner) {
                    const winnerInfo = gameInfo.players.find(p => p.id === gameInfo.winner);
                    const isWinner = gameInfo.winner === playerId;
                    return isWinner ? '🎉 恭喜你获胜！' : `😵 ${winnerInfo?.name} 获胜了！`;
                }
                return '游戏结束';
            default:
                return '';
        }
    };

    /**
     * 渲染玩家列表
     * @returns {JSX.Element} 玩家列表元素
     */
    const renderPlayerList = () => {
        return (
            <div className="players-list">
                <h4>玩家列表</h4>
                {gameInfo.players.map(player => (
                    <div 
                        key={player.id} 
                        className={`player-item ${player.id === playerId ? 'current-player' : ''}`}
                    >
                        <span className="player-name">
                            {player.name} (玩家{player.number})
                            {player.id === playerId && ' (你)'}
                        </span>
                        <div className="player-status">
                            {gameInfo.state === 'placing_pieces' && (
                                <span className={`poison-status ${player.poisonPlaced ? 'placed' : 'not-placed'}`}>
                                    {player.poisonPlaced ? '✅ 已放置' : '⏳ 未放置'}
                                </span>
                            )}
                            {gameInfo.state === 'playing' && gameInfo.currentPlayer === player.id && (
                                <span className="current-turn">🎯 当前回合</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="game-info">
            <div className="info-section">
                <h3>游戏状态</h3>
                <div className="game-status">
                    <p className="state-text">{getGameStateText()}</p>
                    {getCurrentTurnText() && (
                        <p className="turn-text">{getCurrentTurnText()}</p>
                    )}
                </div>
            </div>

            <div className="info-section">
                <h3>游戏提示</h3>
                <p className="hint-text">{getGameHint()}</p>
            </div>

            <div className="info-section">
                {renderPlayerList()}
            </div>

            <div className="info-section">
                <h3>游戏规则</h3>
                <div className="rules-text">
                    <p>• 每位玩家在5x5棋盘上放置一个毒药</p>
                    <p>• 轮流点击格子寻找对方的毒药</p>
                    <p>• 点击到毒药的玩家失败</p>
                    <p>• 点击到空格子会显示面包🍞</p>
                </div>
            </div>

            {gameInfo.state === 'finished' && (
                <div className="info-section game-result">
                    <h3>游戏结果</h3>
                    <div className="result-content">
                        {gameInfo.winner && (
                            <p className="winner-announcement">
                                {getGameHint()}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameInfo;