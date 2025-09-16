class TetrisGame {
    constructor() {
        this.board = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.gameInterval = null;
        this.gameStarted = false;
        this.fastDropInterval = null;
        
        this.initializeGame();
        this.bindEvents();
        // 不再自动开始游戏循环
    }

    initializeGame() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameOver = false;
        this.isPaused = false;
        
        // 初始化空板
        this.board = Array(20).fill().map(() => 
            Array(10).fill(0)
        );
        
        this.updateStatus('准备开始');
        this.updateGameInfo();
        this.renderBoard();
        this.renderNextPiece();
        
        // 获取初始游戏状态
        this.fetchGameState();
    }

    async fetchGameState() {
        try {
            const response = await fetch('/api/game/state');
            if (response.ok) {
                const gameState = await response.json();
                this.updateGameState(gameState);
            }
        } catch (error) {
            console.error('获取游戏状态失败:', error);
        }
    }

    updateGameState(gameState) {
        this.board = gameState.board;
        this.nextPiece = gameState.next_piece;
        this.score = gameState.score;
        this.level = gameState.level;
        this.linesCleared = gameState.lines_cleared;
        this.gameOver = gameState.game_over;
        
        this.updateGameInfo();
        this.renderBoard();
        this.renderNextPiece();
        
        if (this.gameOver) {
            this.updateStatus('游戏结束');
            this.stopGameLoop();
        }
    }

    async moveLeft() {
        if (this.gameOver || this.isPaused) return;
        
        try {
            const response = await fetch('/api/game/move/left', {
                method: 'POST'
            });
            
            if (response.ok) {
                const gameState = await response.json();
                this.updateGameState(gameState);
            }
        } catch (error) {
            console.error('向左移动失败:', error);
        }
    }

    async moveRight() {
        if (this.gameOver || this.isPaused) return;
        
        try {
            const response = await fetch('/api/game/move/right', {
                method: 'POST'
            });
            
            if (response.ok) {
                const gameState = await response.json();
                this.updateGameState(gameState);
            }
        } catch (error) {
            console.error('向右移动失败:', error);
        }
    }

    async moveDown() {
        if (this.gameOver || this.isPaused) return;
        
        try {
            const response = await fetch('/api/game/move/down', {
                method: 'POST'
            });
            
            if (response.ok) {
                const gameState = await response.json();
                this.updateGameState(gameState);
            }
        } catch (error) {
            console.error('向下移动失败:', error);
        }
    }

    async rotate() {
        if (this.gameOver || this.isPaused) return;
        
        try {
            const response = await fetch('/api/game/rotate', {
                method: 'POST'
            });
            
            if (response.ok) {
                const gameState = await response.json();
                this.updateGameState(gameState);
            }
        } catch (error) {
            console.error('旋转失败:', error);
        }
    }

    async hardDrop() {
        if (this.gameOver || this.isPaused) return;
        
        try {
            const response = await fetch('/api/game/hard-drop', {
                method: 'POST'
            });
            
            if (response.ok) {
                const gameState = await response.json();
                this.updateGameState(gameState);
            }
        } catch (error) {
            console.error('硬降失败:', error);
        }
    }

    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startGameLoop();
            this.updateStatus('游戏中');
            document.getElementById('startBtn').style.display = 'none';
        }
    }

    async restartGame() {
        try {
            const response = await fetch('/api/game/restart', {
                method: 'POST'
            });
            
            if (response.ok) {
                const gameState = await response.json();
                this.updateGameState(gameState);
                this.gameStarted = true;
                this.startGameLoop();
                this.updateStatus('游戏中');
                document.getElementById('startBtn').style.display = 'none';
            }
        } catch (error) {
            console.error('重新开始游戏失败:', error);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.stopGameLoop();
            this.updateStatus('已暂停');
        } else {
            this.startGameLoop();
            this.updateStatus('游戏中');
        }
        
        // 更新暂停按钮文本
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
    }

    startGameLoop() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        if (!this.gameOver && !this.isPaused) {
            // 根据等级调整下落速度（等级越高，速度越快）
            // 初始速度1500ms，每级减少100ms，最低不低于500ms
            const speed = Math.max(500, 1500 - (this.level - 1) * 100);
            
            this.gameInterval = setInterval(() => {
                if (!this.isPaused) {
                    this.moveDown();
                }
            }, speed);
        }
    }

    stopGameLoop() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }

    startFastDrop() {
        if (this.gameOver || this.isPaused || !this.gameStarted) return;
        
        // 立即执行一次下降
        this.moveDown();
        
        // 清除之前的定时器（如果存在）
        if (this.fastDropInterval) {
            clearInterval(this.fastDropInterval);
        }
        
        // 设置快速下降定时器（每100ms下降一次）
        this.fastDropInterval = setInterval(() => {
            if (!this.isPaused && this.gameStarted) {
                this.moveDown();
            }
        }, 100);
    }

    stopFastDrop() {
        if (this.fastDropInterval) {
            clearInterval(this.fastDropInterval);
            this.fastDropInterval = null;
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('gameBoard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                if (this.board[row][col]) {
                    cell.classList.add('filled');
                    cell.style.backgroundColor = this.board[row][col];
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    renderNextPiece() {
        const nextPieceBoard = document.getElementById('nextPieceBoard');
        nextPieceBoard.innerHTML = '';
        
        if (!this.nextPiece) return;
        
        const shape = this.nextPiece.shape;
        const color = this.nextPiece.color;
        
        // 创建4x4的网格来显示下一个方块
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'next-cell';
                
                // 检查当前位置是否有方块部分
                if (row < shape.length && col < shape[0].length && shape[row][col]) {
                    cell.classList.add('filled');
                    cell.style.backgroundColor = color;
                }
                
                nextPieceBoard.appendChild(cell);
            }
        }
    }

    updateGameInfo() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.linesCleared;
    }

    updateStatus(message) {
        const statusElement = document.getElementById('gameStatus');
        statusElement.textContent = message;
        
        // 根据状态更新样式
        statusElement.className = 'status';
        if (message === '游戏中') {
            statusElement.classList.add('playing');
        } else if (message === '已暂停') {
            statusElement.classList.add('paused');
        } else if (message === '游戏结束') {
            statusElement.classList.add('game-over');
        }
    }

    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || !this.gameStarted) return;
            
            // 防止页面滚动
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
            }
            
            // 防止键盘重复触发
            if (e.repeat) {
                console.log('忽略重复按键:', e.key);
                return;
            }
            
            console.log('处理按键:', e.key);
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
                case 'ArrowDown':
                    this.startFastDrop();
                    break;
                case 'ArrowUp':
                    this.rotate();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.restartGame();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowDown') {
                this.stopFastDrop();
            }
        });

        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        // 添加手机端按键控制
        this.setupMobileButtons();
    }



    setupMobileButtons() {
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const downBtn = document.getElementById('downBtn');
        
        if (!leftBtn || !rightBtn || !downBtn) return;
        
        let leftInterval = null;
        let rightInterval = null;
        let downInterval = null;
        const moveInterval = 500; // 移动间隔500ms
        
        // 左键控制
        leftBtn.addEventListener('touchstart', (e) => {
            if (this.gameOver || this.isPaused || !this.gameStarted) return;
            e.preventDefault();
            
            // 立即移动一次
            this.immediateMoveLeft();
            
            // 设置长按间隔移动
            leftInterval = setInterval(() => {
                if (this.gameOver || this.isPaused || !this.gameStarted) {
                    clearInterval(leftInterval);
                    return;
                }
                this.immediateMoveLeft();
            }, moveInterval);
        }, { passive: false });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (leftInterval) {
                clearInterval(leftInterval);
                leftInterval = null;
            }
        }, { passive: false });
        
        leftBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            if (leftInterval) {
                clearInterval(leftInterval);
                leftInterval = null;
            }
        }, { passive: false });
        
        // 右键控制
        rightBtn.addEventListener('touchstart', (e) => {
            if (this.gameOver || this.isPaused || !this.gameStarted) return;
            e.preventDefault();
            
            // 立即移动一次
            this.immediateMoveRight();
            
            // 设置长按间隔移动
            rightInterval = setInterval(() => {
                if (this.gameOver || this.isPaused || !this.gameStarted) {
                    clearInterval(rightInterval);
                    return;
                }
                this.immediateMoveRight();
            }, moveInterval);
        }, { passive: false });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (rightInterval) {
                clearInterval(rightInterval);
                rightInterval = null;
            }
        }, { passive: false });
        
        rightBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            if (rightInterval) {
                clearInterval(rightInterval);
                rightInterval = null;
            }
        }, { passive: false });
        
        // 下降键控制
        downBtn.addEventListener('touchstart', (e) => {
            if (this.gameOver || this.isPaused || !this.gameStarted) return;
            e.preventDefault();
            
            // 立即移动一次
            this.immediateMoveDown();
            
            // 设置长按间隔移动
            downInterval = setInterval(() => {
                if (this.gameOver || this.isPaused || !this.gameStarted) {
                    clearInterval(downInterval);
                    return;
                }
                this.immediateMoveDown();
            }, moveInterval);
        }, { passive: false });
        
        downBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (downInterval) {
                clearInterval(downInterval);
                downInterval = null;
            }
        }, { passive: false });
        
        downBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            if (downInterval) {
                clearInterval(downInterval);
                downInterval = null;
            }
        }, { passive: false });
    }

    // 立即执行的移动方法（避免异步延迟）
    immediateMoveLeft() {
        if (this.gameOver || this.isPaused) return;
        this.moveLeft();
    }

    immediateMoveRight() {
        if (this.gameOver || this.isPaused) return;
        this.moveRight();
    }

    immediateMoveDown() {
        if (this.gameOver || this.isPaused) return;
        this.moveDown();
    }

    immediateRotate() {
        if (this.gameOver || this.isPaused) return;
        this.rotate();
    }

    immediateHardDrop() {
        if (this.gameOver || this.isPaused) return;
        this.hardDrop();
    }
}

// 游戏切换功能
class GameCollection {
    constructor() {
        this.currentGame = 'tetris';
        this.tetrisGame = null;
        this.reversiGame = null;
        this.init();
    }

    init() {
        this.bindGameSelectorEvents();
        this.showGame('tetris');
        
        // 初始化俄罗斯方块游戏
        document.addEventListener('DOMContentLoaded', () => {
            this.tetrisGame = new TetrisGame();
            window.game = this.tetrisGame;
        });
    }

    bindGameSelectorEvents() {
        const gameButtons = document.querySelectorAll('.game-btn');
        
        gameButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const gameType = e.target.dataset.game;
                this.switchGame(gameType);
            });
        });
    }

    switchGame(gameType) {
        if (gameType === this.currentGame) return;
        
        // 更新按钮状态
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-game="${gameType}"]`).classList.add('active');
        
        // 隐藏当前游戏，显示新游戏
        this.hideCurrentGame();
        this.showGame(gameType);
        
        this.currentGame = gameType;
        
        // 处理游戏切换逻辑
        if (gameType === 'tetris') {
            // 切换到俄罗斯方块
            if (this.tetrisGame && this.tetrisGame.gameStarted) {
                this.tetrisGame.togglePause();
            }
        } else if (gameType === 'reversi') {
            // 切换到黑白棋
            this.initializeReversiGame();
        }
    }

    initializeReversiGame() {
        // 动态加载黑白棋脚本（如果尚未加载）
        if (!window.reversiGame) {
            // 创建script元素
            const script = document.createElement('script');
            script.src = "/static/reversi.js";
            script.onload = () => {
                // 脚本加载完成后初始化游戏
                this.setupReversiGame();
            };
            document.head.appendChild(script);
        } else if (!this.reversiGame) {
            // 如果脚本已加载但游戏未初始化
            this.setupReversiGame();
        } else {
            // 如果游戏已经初始化，确保尺寸选择器正常工作
            this.setupReversiSizeSelector();
        }
    }

    setupReversiGame() {
        // 获取选择的棋盘尺寸
        const sizeSelect = document.getElementById('reversiBoardSize');
        const boardSize = sizeSelect ? parseInt(sizeSelect.value) : 8;
        
        // 初始化游戏
        window.reversiGame = new ReversiGame(boardSize);
        this.reversiGame = window.reversiGame;
        
        // 设置尺寸选择器事件
        this.setupReversiSizeSelector();
        this.setupReversiAISelector();
    }

    setupReversiSizeSelector() {
        const sizeBtn = document.getElementById('reversiSizeBtn');
        const sizeSelect = document.getElementById('reversiBoardSize');
        
        if (sizeBtn && sizeSelect) {
            // 移除现有的事件监听器（避免重复绑定）
            const newSizeBtn = sizeBtn.cloneNode(true);
            sizeBtn.parentNode.replaceChild(newSizeBtn, sizeBtn);
            
            // 绑定新的事件
            newSizeBtn.addEventListener('click', () => {
                const newSize = parseInt(sizeSelect.value);
                if (window.reversiGame) {
                    // 重新创建游戏实例
                    window.reversiGame = new ReversiGame(newSize);
                    this.reversiGame = window.reversiGame;
                }
            });
        }
    }

    setupReversiAISelector() {
        const aiBtn = document.getElementById('reversiAIBtn');
        const aiSelect = document.getElementById('reversiAILevel');
        const aiColorSelect = document.getElementById('reversiAIColor');
        
        if (aiBtn && aiSelect && aiColorSelect) {
            // 移除现有的事件监听器（避免重复绑定）
            const newAIBtn = aiBtn.cloneNode(true);
            aiBtn.parentNode.replaceChild(newAIBtn, aiBtn);
            
            // 绑定新的事件
            newAIBtn.addEventListener('click', () => {
                const aiLevel = aiSelect.value;
                const aiColor = parseInt(aiColorSelect.value);
                if (window.reversiGame) {
                    window.reversiGame.setAIColor(aiColor);
                    window.reversiGame.setAILevel(aiLevel);
                    
                    // 更新按钮文本
                    const levelNames = {
                        'none': '无AI',
                        'novice': '小兵级',
                        'amateur': '业余级',
                        'master': '大师级'
                    };
                    const colorNames = {
                        1: '黑棋',
                        2: '白棋'
                    };
                    newAIBtn.textContent = `AI: ${levelNames[aiLevel]}(${colorNames[aiColor]})`;
                }
            });
        }
    }

    hideCurrentGame() {
        const currentWindow = document.querySelector('.game-window.active');
        if (currentWindow) {
            currentWindow.classList.remove('active');
        }
    }

    showGame(gameType) {
        const targetWindow = document.getElementById(`${gameType}-window`);
        if (targetWindow) {
            targetWindow.classList.add('active');
        }
    }
}

// 初始化游戏合集
const gameCollection = new GameCollection();