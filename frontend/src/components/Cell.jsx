import React from 'react';
import './Cell.css';

/**
 * 棋盘格子组件
 * 处理点击事件并显示不同状态 (空、面包、毒药、击中、未击中)
 * @param {Object} props - 组件属性
 * @param {number} props.x - X坐标
 * @param {number} props.y - Y坐标
 * @param {string} props.state - 格子状态
 * @param {boolean} props.isClickable - 是否可点击
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {boolean} props.isMyPiece - 是否是我的棋子（用于放置阶段）
 */
const Cell = ({ x, y, state, isClickable, onClick, isMyPiece }) => {
    /**
     * 处理格子点击事件
     */
    const handleClick = () => {
        if (isClickable && onClick) {
            onClick(x, y);
        }
    };

    /**
     * 获取格子显示内容
     * @returns {string} 显示内容
     */
    const getCellContent = () => {
        switch (state) {
            case 'bread':
                return '🍞'; // 面包
            case 'poison':
                return '☠️'; // 毒药
            case 'revealed':
                return '❌'; // 已揭示但无内容
            default:
                if (isMyPiece) {
                    return '☠️'; // 显示我的毒药位置
                }
                return ''; // 空格子
        }
    };

    /**
     * 获取格子CSS类名
     * @returns {string} CSS类名
     */
    const getCellClassName = () => {
        let className = 'cell';
        
        if (isClickable) {
            className += ' clickable';
        }
        
        if (state === 'bread') {
            className += ' bread';
        } else if (state === 'poison') {
            className += ' poison';
        } else if (state === 'revealed') {
            className += ' revealed';
        }
        
        if (isMyPiece) {
            className += ' my-piece';
        }
        
        return className;
    };

    return (
        <div 
            className={getCellClassName()}
            onClick={handleClick}
            title={`位置: (${x}, ${y})`}
        >
            <span className="cell-content">{getCellContent()}</span>
            <div className="cell-coordinates">{x},{y}</div>
        </div>
    );
};

export default Cell;