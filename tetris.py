from flask import Flask, render_template, jsonify, request, session
from flask_cors import CORS
import random
import uuid

app = Flask(__name__)
CORS(app)
app.secret_key = 'your-secret-key-here'  # 请在生产环境中使用更安全的密钥

# 俄罗斯方块形状定义
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[1, 1, 1], [0, 1, 0]],  # T
    [[1, 1, 1], [1, 0, 0]],  # L
    [[1, 1, 1], [0, 0, 1]],  # J
    [[0, 1, 1], [1, 1, 0]],  # S
    [[1, 1, 0], [0, 1, 1]]   # Z
]

SHAPE_COLORS = [
    '#FFFFFF',  # I - 白色
    '#FFFFFF',  # O - 白色
    '#FFFFFF',  # T - 白色
    '#FFFFFF',  # L - 白色
    '#FFFFFF',  # J - 白色
    '#FFFFFF',  # S - 白色
    '#FFFFFF'   # Z - 白色
]

class Tetris:
    def __init__(self, width=10, height=20):
        self.width = width
        self.height = height
        self.board = [[0 for _ in range(width)] for _ in range(height)]
        self.current_piece = None
        self.next_piece = None
        self.piece_x = 0
        self.piece_y = 0
        self.game_over = False
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.initialize_game()
    
    def initialize_game(self):
        """初始化游戏"""
        self.board = [[0 for _ in range(self.width)] for _ in range(self.height)]
        self.game_over = False
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.generate_new_piece()
        self.generate_new_piece()
    
    def generate_new_piece(self):
        """生成新的方块"""
        if self.next_piece is not None:
            self.current_piece = self.next_piece
        else:
            shape_index = random.randint(0, len(SHAPES) - 1)
            self.current_piece = {
                'shape': SHAPES[shape_index],
                'color': SHAPE_COLORS[shape_index]
            }
        
        shape_index = random.randint(0, len(SHAPES) - 1)
        self.next_piece = {
            'shape': SHAPES[shape_index],
            'color': SHAPE_COLORS[shape_index]
        }
        
        # 设置初始位置（居中）
        self.piece_x = self.width // 2 - len(self.current_piece['shape'][0]) // 2
        self.piece_y = 0
        
        # 检查游戏是否结束
        if self.check_collision():
            self.game_over = True
    
    def check_collision(self):
        """检查碰撞"""
        shape = self.current_piece['shape']
        for y in range(len(shape)):
            for x in range(len(shape[0])):
                if shape[y][x]:
                    board_x = self.piece_x + x
                    board_y = self.piece_y + y
                    
                    if (board_x < 0 or board_x >= self.width or
                        board_y >= self.height or
                        (board_y >= 0 and self.board[board_y][board_x])):
                        return True
        return False
    
    def merge_piece(self):
        """将当前方块合并到游戏板上"""
        shape = self.current_piece['shape']
        for y in range(len(shape)):
            for x in range(len(shape[0])):
                if shape[y][x]:
                    board_x = self.piece_x + x
                    board_y = self.piece_y + y
                    if 0 <= board_y < self.height and 0 <= board_x < self.width:
                        self.board[board_y][board_x] = self.current_piece['color']
    
    def clear_lines(self):
        """清除已填满的行"""
        lines_to_clear = []
        for y in range(self.height):
            if all(self.board[y]):
                lines_to_clear.append(y)
        
        for line in lines_to_clear:
            del self.board[line]
            self.board.insert(0, [0 for _ in range(self.width)])
        
        # 计算得分
        if lines_to_clear:
            self.lines_cleared += len(lines_to_clear)
            self.score += {1: 100, 2: 300, 3: 500, 4: 800}[len(lines_to_clear)] * self.level
            self.level = self.lines_cleared // 10 + 1
        
        return len(lines_to_clear)
    
    def move_left(self):
        """向左移动"""
        self.piece_x -= 1
        if self.check_collision():
            self.piece_x += 1
            return False
        return True
    
    def move_right(self):
        """向右移动"""
        self.piece_x += 1
        if self.check_collision():
            self.piece_x -= 1
            return False
        return True
    
    def move_down(self):
        """向下移动"""
        self.piece_y += 1
        if self.check_collision():
            self.piece_y -= 1
            self.merge_piece()
            self.clear_lines()
            self.generate_new_piece()
            return False
        return True
    
    def rotate(self):
        """旋转方块"""
        old_shape = self.current_piece['shape']
        # 转置矩阵
        rotated = [[old_shape[y][x] for y in range(len(old_shape)-1, -1, -1)] 
                  for x in range(len(old_shape[0]))]
        
        old_current = self.current_piece['shape']
        self.current_piece['shape'] = rotated
        
        if self.check_collision():
            self.current_piece['shape'] = old_current
            return False
        return True
    
    def hard_drop(self):
        """硬降（直接落到底部）"""
        while self.move_down():
            pass
    
    def get_game_state(self):
        """获取游戏状态"""
        # 创建包含当前方板的副本
        display_board = [row[:] for row in self.board]
        
        # 将当前方块添加到显示板中
        if self.current_piece and not self.game_over:
            shape = self.current_piece['shape']
            for y in range(len(shape)):
                for x in range(len(shape[0])):
                    if shape[y][x]:
                        board_x = self.piece_x + x
                        board_y = self.piece_y + y
                        if 0 <= board_y < self.height and 0 <= board_x < self.width:
                            display_board[board_y][board_x] = self.current_piece['color']
        
        return {
            'board': display_board,
            'next_piece': self.next_piece,
            'score': self.score,
            'level': self.level,
            'lines_cleared': self.lines_cleared,
            'game_over': self.game_over
        }

# 游戏实例管理
games = {}

def get_or_create_game():
    """获取或创建当前会话的游戏实例"""
    if 'game_id' not in session:
        session['game_id'] = str(uuid.uuid4())
    
    game_id = session['game_id']
    if game_id not in games:
        games[game_id] = Tetris()
    
    return games[game_id]

@app.route('/')
def index():
    # 确保每个会话都有游戏实例
    get_or_create_game()
    return render_template('index.html')

@app.route('/api/game/state', methods=['GET'])
def get_game_state():
    game = get_or_create_game()
    return jsonify(game.get_game_state())

@app.route('/api/game/move/left', methods=['POST'])
def move_left():
    game = get_or_create_game()
    if game.game_over:
        return jsonify({'error': 'Game over'}), 400
    
    success = game.move_left()
    return jsonify(game.get_game_state())

@app.route('/api/game/move/right', methods=['POST'])
def move_right():
    game = get_or_create_game()
    if game.game_over:
        return jsonify({'error': 'Game over'}), 400
    
    success = game.move_right()
    return jsonify(game.get_game_state())

@app.route('/api/game/move/down', methods=['POST'])
def move_down():
    game = get_or_create_game()
    if game.game_over:
        return jsonify({'error': 'Game over'}), 400
    
    success = game.move_down()
    return jsonify(game.get_game_state())

@app.route('/api/game/rotate', methods=['POST'])
def rotate():
    game = get_or_create_game()
    if game.game_over:
        return jsonify({'error': 'Game over'}), 400
    
    success = game.rotate()
    return jsonify(game.get_game_state())

@app.route('/api/game/hard-drop', methods=['POST'])
def hard_drop():
    game = get_or_create_game()
    if game.game_over:
        return jsonify({'error': 'Game over'}), 400
    
    game.hard_drop()
    return jsonify(game.get_game_state())

@app.route('/api/game/restart', methods=['POST'])
def restart_game():
    game = get_or_create_game()
    game.initialize_game()
    return jsonify(game.get_game_state())

if __name__ == '__main__':
    app.run(debug=True, port=5000)