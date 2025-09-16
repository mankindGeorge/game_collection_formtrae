class ReversiGame {
    constructor(boardSize = 8) {
        this.boardSize = boardSize;
        this.board = null;
        this.currentPlayer = 1; // 1: 黑棋, 2: 白棋
        this.gameStarted = false;
        this.gameOver = false;
        this.validMoves = [];
        
        this.initializeGame();
        this.bindEvents();
        
        // AI相关属性
        this.aiLevel = 'none'; // 'none', 'novice', 'amateur', 'master'
        this.aiPlayer = 2; // AI默认使用白棋
        this.aiThinking = false;
    }

    initializeGame() {
        // 初始化空棋盘
        this.board = Array(this.boardSize).fill().map(() => 
            Array(this.boardSize).fill(0)
        );
        
        // 设置初始棋子（居中放置）
        const mid = Math.floor(this.boardSize / 2);
        if (this.boardSize % 2 === 0) {
            // 偶数尺寸：标准黑白棋初始布局
            this.board[mid - 1][mid - 1] = 2;     // 白棋
            this.board[mid - 1][mid] = 1;         // 黑棋
            this.board[mid][mid - 1] = 1;         // 黑棋
            this.board[mid][mid] = 2;             // 白棋
        } else {
            // 奇数尺寸：居中放置初始棋子
            this.board[mid][mid] = 1;             // 黑棋居中
            // 在周围放置白棋
            if (mid > 0) {
                this.board[mid - 1][mid] = 2;     // 上
                this.board[mid][mid - 1] = 2;     // 左
                this.board[mid][mid + 1] = 2;     // 右
                this.board[mid + 1][mid] = 2;     // 下
            }
        }
        
        this.currentPlayer = 1;
        this.gameOver = false;
        this.gameStarted = true;
        
        this.updateValidMoves();
        this.renderBoard();
        this.updateGameInfo();
    }

    updateValidMoves() {
        this.validMoves = [];
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.isValidMove(x, y, this.currentPlayer)) {
                    this.validMoves.push({x, y});
                }
            }
        }
    }

    isValidMove(x, y, player) {
        if (this.board[y][x] !== 0) return false;
        
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            if (this.checkDirection(x, y, dx, dy, player)) {
                return true;
            }
        }
        
        return false;
    }

    checkDirection(x, y, dx, dy, player) {
        let currentX = x + dx;
        let currentY = y + dy;
        let foundOpponent = false;
        
        while (currentX >= 0 && currentX < this.boardSize && 
               currentY >= 0 && currentY < this.boardSize) {
            
            const cell = this.board[currentY][currentX];
            
            if (cell === 0) return false;
            if (cell === player) return foundOpponent;
            
            foundOpponent = true;
            currentX += dx;
            currentY += dy;
        }
        
        return false;
    }

    makeMove(x, y) {
        if (this.gameOver || !this.isValidMove(x, y, this.currentPlayer)) {
            return false;
        }
        
        // 放置棋子
        this.board[y][x] = this.currentPlayer;
        
        // 翻转对手棋子
        this.flipPieces(x, y, this.currentPlayer);
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        // 更新有效移动
        this.updateValidMoves();
        
        // 检查游戏是否结束
        if (this.validMoves.length === 0) {
            // 如果没有有效移动，切换玩家
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.updateValidMoves();
            
            if (this.validMoves.length === 0) {
                this.gameOver = true;
                this.determineWinner();
            }
        }
        
        this.renderBoard();
        this.updateGameInfo();
        
        // 如果是AI的回合，自动下棋
        if (!this.gameOver && this.currentPlayer === this.aiPlayer && this.aiLevel !== 'none') {
            this.makeAIMove();
        }
        
        return true;
    }

    // AI决策方法
    setAIColor(color) {
        this.aiPlayer = color;
        // 如果是AI的回合，立即开始思考
        if (!this.gameOver && this.currentPlayer === this.aiPlayer && this.aiLevel !== 'none') {
            this.makeAIMove();
        }
    }

    setAILevel(level) {
        this.aiLevel = level;
        // 如果是AI的回合，立即开始思考
        if (!this.gameOver && this.currentPlayer === this.aiPlayer && level !== 'none') {
            this.makeAIMove();
        }
    }

    makeAIMove() {
        if (this.aiThinking || this.gameOver) return;
        
        this.aiThinking = true;
        
        // 添加一点延迟，让AI思考看起来更自然
        setTimeout(() => {
            let move;
            
            switch (this.aiLevel) {
                case 'master':
                    move = this.getGreedyMove();
                    break;
                case 'amateur':
                    move = this.getAmateurMove();
                    break;
                case 'novice':
                    move = this.getNoviceMove();
                    break;
                default:
                    move = null;
            }
            
            if (move) {
                this.makeMove(move.x, move.y);
            }
            
            this.aiThinking = false;
        }, 500);
    }

    // 大师级AI：贪心算法，选择翻转最多棋子的位置
    getGreedyMove() {
        let bestMove = null;
        let maxFlips = -1;
        
        for (const move of this.validMoves) {
            const flips = this.countFlips(move.x, move.y, this.currentPlayer);
            if (flips > maxFlips) {
                maxFlips = flips;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    // 业余级AI：50%概率使用贪心算法，50%概率随机下
    getAmateurMove() {
        if (Math.random() < 0.5) {
            return this.getGreedyMove();
        } else {
            return this.getNoviceMove();
        }
    }

    // 小兵级AI：完全随机下棋
    getNoviceMove() {
        if (this.validMoves.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.validMoves.length);
        return this.validMoves[randomIndex];
    }

    // 计算某个位置可以翻转的棋子数量
    countFlips(x, y, player) {
        let totalFlips = 0;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            let flipsInDirection = 0;
            let currentX = x + dx;
            let currentY = y + dy;
            
            while (currentX >= 0 && currentX < this.boardSize && 
                   currentY >= 0 && currentY < this.boardSize) {
                
                const cell = this.board[currentY][currentX];
                
                if (cell === 0) break;
                if (cell === player) {
                    totalFlips += flipsInDirection;
                    break;
                }
                
                flipsInDirection++;
                currentX += dx;
                currentY += dy;
            }
        }
        
        return totalFlips;
    }

    flipPieces(x, y, player) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            if (this.checkDirection(x, y, dx, dy, player)) {
                let currentX = x + dx;
                let currentY = y + dy;
                
                while (this.board[currentY][currentX] !== player) {
                    this.board[currentY][currentX] = player;
                    currentX += dx;
                    currentY += dy;
                }
            }
        }
    }

    determineWinner() {
        let blackCount = 0;
        let whiteCount = 0;
        
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] === 1) blackCount++;
                if (this.board[y][x] === 2) whiteCount++;
            }
        }
        
        const statusElement = document.getElementById('reversiStatus');
        if (blackCount > whiteCount) {
            statusElement.textContent = `游戏结束 - 黑棋胜利 (${blackCount}:${whiteCount})`;
        } else if (whiteCount > blackCount) {
            statusElement.textContent = `游戏结束 - 白棋胜利 (${blackCount}:${whiteCount})`;
        } else {
            statusElement.textContent = `游戏结束 - 平局 (${blackCount}:${whiteCount})`;
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('reversiBoard');
        boardElement.innerHTML = '';
        
        // 设置CSS变量用于响应式布局
        document.documentElement.style.setProperty('--board-size', this.boardSize);
        
        // 设置网格布局（确保棋盘正确显示）
        boardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
        
        // 根据棋盘尺寸动态调整容器大小
        this.adjustContainerForBoardSize();
        
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'reversi-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // 添加触摸事件支持
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // 防止默认行为
                    this.handleCellClick(x, y);
                }, { passive: false });
                
                if (this.board[y][x] === 1) {
                    cell.classList.add('black');
                } else if (this.board[y][x] === 2) {
                    cell.classList.add('white');
                }
                
                // 标记有效移动位置
                const isValidMove = this.validMoves.some(move => move.x === x && move.y === y);
                if (isValidMove && !this.gameOver) {
                    cell.classList.add('valid-move');
                }
                
                cell.addEventListener('click', () => this.handleCellClick(x, y));
                boardElement.appendChild(cell);
            }
        }
    }

    handleCellClick(x, y) {
        if (this.makeMove(x, y)) {
            // 移动成功后的处理
        }
    }

    updateGameInfo() {
        const playerElement = document.getElementById('reversiPlayer');
        const blackCountElement = document.getElementById('reversiBlackCount');
        const whiteCountElement = document.getElementById('reversiWhiteCount');
        const statusElement = document.getElementById('reversiStatus');
        
        // 计算棋子数量
        let blackCount = 0;
        let whiteCount = 0;
        
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] === 1) blackCount++;
                if (this.board[y][x] === 2) whiteCount++;
            }
        }
        
        playerElement.textContent = this.currentPlayer === 1 ? '黑棋' : '白棋';
        playerElement.className = this.currentPlayer === 1 ? 'black-text' : 'white-text';
        blackCountElement.textContent = blackCount;
        whiteCountElement.textContent = whiteCount;
        
        if (!this.gameOver) {
            statusElement.textContent = this.validMoves.length === 0 ? '无有效移动' : '游戏中';
        }
    }

    bindEvents() {
        const restartBtn = document.getElementById('reversiRestartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        // 监听窗口大小变化，重新渲染棋盘以适应响应式布局
        window.addEventListener('resize', () => {
            if (this.gameStarted) {
                this.renderBoard();
            }
        });
    }

    restartGame() {
        this.initializeGame();
    }
    
    // 根据棋盘尺寸调整容器大小
    adjustContainerForBoardSize() {
        const container = document.querySelector('.reversi-container');
        if (!container) return;
        
        // 在移动端，简化调整逻辑，让CSS完全控制布局
        if (window.innerWidth <= 768) {
            // 移除所有内联样式，让CSS媒体查询完全控制
            container.style.maxWidth = '';
            const boardElement = document.getElementById('reversiBoard');
            if (boardElement) {
                boardElement.style.maxWidth = '';
            }
        } else {
            // 桌面端保持适当的最大宽度
            const maxBoardWidth = Math.min(600, this.boardSize * 50 + 100);
            container.style.maxWidth = `${maxBoardWidth}px`;
        }
    }
}

// 全局黑白棋实例
let reversiGame = null;

// 初始化黑白棋游戏
document.addEventListener('DOMContentLoaded', () => {
    const reversiWindow = document.getElementById('reversi-window');
    if (reversiWindow && reversiWindow.classList.contains('active')) {
        reversiGame = new ReversiGame();
    }
});