import React from 'react';
import Cell from './Cell';
import './Board.css';

/**
 * 棋盘组件
 * 可根据props适配不同尺寸和模式
 * @param {Object} props - 组件属性
 * @param {Array} props.board - 棋盘数据
 * @param {string} props.gameState - 游戏状态
 * @param {string} props.currentPlayer - 当前玩家
 * @param {string} props.playerId - 当前用户ID
 * @param {Map} props.myPoisonPosition - 我的毒药位置
 * @param {Function} props.onCellClick - 格子点击处理函数
 * @param {number} props.size - 棋盘大小（默认5）
 */
const Board = ({ 
    board, 
    gameState, 
    currentPlayer, 
    playerId, 
    myPoisonPosition,
    onCellClick,
    size = 5 
}) => {
    /**
     * 判断格子是否可点击
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否可点击
     */
    const isCellClickable = (x, y) => {
        if (!board || !board[x] || !playerId) return false;

        // 放置阶段：只有空格子可点击
        if (gameState === 'placing_pieces') {
            return board[x][y] === 'empty' && !isPositionOccupied(x, y);
        }

        // 游戏进行阶段：轮到自己且格子未被揭示
        if (gameState === 'playing') {
            return currentPlayer === playerId && board[x][y] === 'empty';
        }

        return false;
    };

    /**
     * 检查位置是否已被占用（有其他玩家的毒药）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否被占用
     */
    const isPositionOccupied = (x, y) => {
        // 这里需要从gameInfo中获取其他玩家的毒药位置
        // 在实际实现中，服务器不会发送其他玩家的毒药位置
        return false;
    };

    /**
     * 判断是否是我的棋子位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否是我的棋子
     */
    const isMyPiece = (x, y) => {
        if (!myPoisonPosition) return false;
        return myPoisonPosition.x === x && myPoisonPosition.y === y;
    };

    /**
     * 处理格子点击
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    const handleCellClick = (x, y) => {
        if (onCellClick) {
            onCellClick(x, y);
        }
    };

    /**
     * 渲染棋盘行
     * @param {number} rowIndex - 行索引
     * @returns {JSX.Element} 行元素
     */
    const renderRow = (rowIndex) => {
        const cells = [];
        for (let colIndex = 0; colIndex < size; colIndex++) {
            const cellState = board[rowIndex] ? board[rowIndex][colIndex] : 'empty';
            cells.push(
                <Cell
                    key={`${rowIndex}-${colIndex}`}
                    x={rowIndex}
                    y={colIndex}
                    state={cellState}
                    isClickable={isCellClickable(rowIndex, colIndex)}
                    onClick={handleCellClick}
                    isMyPiece={isMyPiece(rowIndex, colIndex)}
                />
            );
        }
        return (
            <div key={rowIndex} className="board-row">
                {cells}
            </div>
        );
    };

    /**
     * 渲染整个棋盘
     * @returns {JSX.Element} 棋盘元素
     */
    const renderBoard = () => {
        const rows = [];
        for (let i = 0; i < size; i++) {
            rows.push(renderRow(i));
        }
        return rows;
    };

    return (
        <div className={`board board-${size}x${size}`}>
            <div className="board-container">
                {renderBoard()}
            </div>
        </div>
    );
};

export default Board;