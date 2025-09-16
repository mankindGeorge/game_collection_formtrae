# 俄罗斯方块游戏 (Tetris)

一个基于Python Flask后端和JavaScript前端的现代化俄罗斯方块游戏，支持多设备独立游戏状态和移动端触摸控制。

## 🎮 功能特性

- **多设备支持**: 每台设备拥有独立的游戏状态，使用Flask session进行会话隔离
- **响应式设计**: 完美适配桌面端和移动端，提供最佳用户体验
- **触摸控制**: 移动端支持按钮触摸和长按功能
- **实时交互**: WebSocket风格的API通信，实时更新游戏状态
- **现代化UI**: 美观的渐变背景和流畅的动画效果

## 🏗️ 项目架构

### 后端 (Python Flask)

```
tetris.py
├── Tetris类 (游戏核心逻辑)
│   ├── 方块生成和移动
│   ├── 碰撞检测
│   ├── 行消除和计分
│   └── 游戏状态管理
├── 游戏实例管理
│   ├── 会话隔离 (session-based)
│   ├── 多设备支持
│   └── 自动清理
└── RESTful API
    ├── GET /api/game/state
    ├── POST /api/game/move/*
    ├── POST /api/game/rotate
    ├── POST /api/game/hard-drop
    └── POST /api/game/restart
```

### 前端 (HTML/CSS/JavaScript)

```
templates/index.html          # 主页面结构
static/style.css             # 样式和响应式设计
static/game.js              # 游戏前端逻辑和控制
```

## 🔧 技术栈

- **后端**: Python 3.x, Flask, Flask-CORS
- **前端**: HTML5, CSS3 (Grid/Flexbox), JavaScript (ES6+)
- **通信**: RESTful API, JSON
- **会话管理**: Flask Session, UUID

## 🎯 核心逻辑

### 游戏机制

1. **方块生成**: 7种经典俄罗斯方块形状，随机生成
2. **移动控制**: 左右移动、旋转、加速下落、硬降
3. **碰撞检测**: 边界检测和方块堆叠检测
4. **行消除**: 满行自动消除并计分
5. **等级系统**: 每消除10行提升一个等级，下落速度加快

### 多设备会话管理

```python
def get_or_create_game():
    # 为每个会话创建唯一游戏实例
    if 'game_id' not in session:
        session['game_id'] = str(uuid.uuid4())
    
    game_id = session['game_id']
    if game_id not in games:
        games[game_id] = Tetris()
    
    return games[game_id]
```

### 前端状态同步

```javascript
class TetrisGame {
    // 游戏状态管理
    updateGameState() {
        // 从后端API获取最新游戏状态
        // 更新UI显示（分数、等级、下一个方块等）
    }
    
    // 控制逻辑
    bindEvents() {
        // 键盘事件监听
        // 移动端按钮事件监听
        // 触摸事件处理
    }
}
```

## 📱 移动端特性

### 布局优化
- **下一个方块位置**: 移动端显示在游戏面板左侧
- **响应式设计**: 自适应不同屏幕尺寸
- **触摸友好**: 大尺寸按钮和合适的间距

### 控制方式
1. **屏幕按钮**: 方向控制、旋转、硬降
2. **长按功能**: 左右和下降按钮支持长按连续移动
3. **触摸事件**: 完整的touchstart/touchend/touchcancel处理

## 🚀 快速开始

### 安装依赖
```bash
pip install flask flask-cors
```

### 启动服务器
```bash
python tetris.py
```

### 访问游戏
打开浏览器访问: http://localhost:5000

## 🎮 操作说明

### 桌面端
- **← →**: 左右移动
- **↑**: 旋转方块
- **↓**: 加速下落
- **空格**: 硬降（直接落底）
- **P**: 暂停/继续
- **R**: 重新开始

### 移动端
- **屏幕按钮**: 触控操作
- **长按**: 左右和下降按钮支持长按连续移动

## 🔄 API接口

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/game/state` | GET | 获取当前游戏状态 |
| `/api/game/move/left` | POST | 向左移动 |
| `/api/game/move/right` | POST | 向右移动 |
| `/api/game/move/down` | POST | 向下移动 |
| `/api/game/rotate` | POST | 旋转方块 |
| `/api/game/hard-drop` | POST | 硬降操作 |
| `/api/game/restart` | POST | 重新开始游戏 |

## 🎨 样式架构

### 响应式断点
- **桌面端**: > 768px - 侧边栏布局
- **移动端**: ≤ 768px - 垂直堆叠布局
- **小屏幕**: ≤ 480px - 紧凑布局

### CSS特性
- **CSS Grid**: 游戏面板和下一个方块显示
- **Flexbox**: 布局和对齐
- **渐变背景**: 现代化视觉效果
- **过渡动画**: 平滑的交互体验

## 🔧 自定义配置

### 游戏参数
在 `tetris.py` 中可以调整:
- 游戏板大小 (width, height)
- 方块形状和颜色
- 计分规则

### 样式定制
在 `style.css` 中可以修改:
- 颜色主题
- 布局尺寸
- 响应式断点

## 📝 开发说明

### 项目结构
```
d:\aa\
├── tetris.py          # Flask后端主文件
├── templates/
│   └── index.html     # 前端HTML模板
├── static/
│   ├── game.js        # 前端JavaScript逻辑
│   └── style.css      # 样式文件
├── requirements.txt   # Python依赖
└── README.md          # 项目说明
```

### 扩展建议
1. **数据库集成**: 添加用户系统和分数记录
2. **WebSocket**: 实时多人游戏功能
3. **音效系统**: 游戏音效和背景音乐
4. **主题切换**: 多套视觉主题

## 📞 技术支持

如有问题或建议，请检查:
1. 控制台错误信息
2. 网络请求状态
3. 浏览器兼容性

---

享受游戏！ 🎮