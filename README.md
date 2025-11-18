# 女巫毒药游戏 (Witch Poison Game)

一个基于 WebSocket 的实时双人在线对战游戏。

## 游戏简介

这是一个类似于海战棋的双人游戏。每位玩家在 5x5 的棋盘上秘密放置一个毒药，然后轮流点击格子寻找对方的毒药。点击到毒药的玩家输掉游戏！

## 技术栈

### 后端
- Node.js
- Express
- Socket.IO
- UUID

### 前端
- React 18
- Vite
- React Router
- Socket.IO Client

## 安装和运行

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 启动服务器

**启动后端服务器：**
```bash
cd backend
npm start
```
后端服务器将运行在 http://localhost:3001

**启动前端开发服务器：**
```bash
cd frontend
npm run dev
```
前端开发服务器将运行在 http://localhost:3000

### 3. 开始游戏

1. 在浏览器中打开 http://localhost:3000
2. 输入玩家名称
3. 选择"创建游戏"或"加入游戏"
4. 如果创建游戏，分享游戏 ID 给朋友
5. 两位玩家都加入后，各自选择一个格子放置毒药
6. 轮流点击格子，寻找对方的毒药
7. 点到毒药的玩家失败！

## 游戏规则

1. **放置阶段**：每位玩家在 5x5 棋盘上选择一个位置放置毒药（毒药位置对对方保密）
2. **游戏阶段**：玩家轮流点击棋盘格子
3. **面包格子**：点击空格子会显示面包 🍞
4. **毒药格子**：点击到毒药 ☠️ 的玩家失败，对方获胜
5. **限制**：每个格子只能被点击一次

## 开发路线图

- [x] v0.1：经典模式核心玩法（MVP）
- [ ] v0.2：海战棋模式（10x10 棋盘，多个船只）
- [ ] v0.3：完善游戏体验和 UI
- [ ] v1.0：正式版与部署

## 项目结构

```
PoisonWitch/
├── backend/
│   ├── server.js              # 服务器入口
│   ├── game/
│   │   ├── Game.js           # 游戏逻辑
│   │   └── GameManager.js    # 游戏房间管理
│   └── network/
│       └── socketHandler.js  # WebSocket 事件处理
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── websocket.js  # WebSocket 客户端
│   │   ├── components/
│   │   │   ├── Board.jsx     # 棋盘组件
│   │   │   ├── Cell.jsx      # 格子组件
│   │   │   └── GameInfo.jsx  # 游戏信息组件
│   │   ├── views/
│   │   │   ├── Home.jsx      # 主页
│   │   │   └── GameRoom.jsx  # 游戏房间
│   │   ├── hooks/
│   │   │   └── useGameStore.js # 游戏状态管理
│   │   └── App.jsx           # 应用主组件
│   └── index.html
└── README.md
```

## 常见问题

### 无法连接到服务器
确保后端服务器正在运行，并且端口 3001 未被占用。

### 游戏无法开始
确保两位玩家都已加入游戏，并且都已放置毒药。

### 页面刷新后游戏断开
目前版本不支持断线重连，刷新页面会导致游戏中断。这将在 v0.3 版本中修复。

## 许可证

MIT License

## 作者

WitchPoison Team
