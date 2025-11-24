class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas ? this.holdCanvas.getContext('2d') : null;

        this.BLOCK_SIZE = 30;
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;

        this.board = this.createBoard();
        this.pieceQueue = this.generatePieceQueue();
        this.currentPiece = this.getNextPiece();
        this.nextPiece = this.getNextPiece();
        this.holdPiece = null;
        this.canHold = true; // Можно ли сейчас сделать ход с удержанием
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.isPaused = false;

        this.playerName = localStorage.getItem('tetris.username') || 'Player';
        document.getElementById('player-name').textContent = this.playerName;

        // Обновляем UI при создании игры
        this.updateUI();

        this.setupEventListeners();
        this.gameLoop();
    }

    createBoard() {
        return Array.from({ length: this.BOARD_HEIGHT }, () =>
            Array(this.BOARD_WIDTH).fill(0)
        );
    }

    // Определение фигур тетрамино
    PIECES = [
        { shape: [[1, 1, 1, 1]], color: '#00f0f0', name: 'I' }, // I
        { shape: [[1, 1], [1, 1]], color: '#f0f000', name: 'O' }, // O
        { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0', name: 'T' }, // T
        { shape: [[1, 1, 0], [0, 1, 1]], color: '#00f000', name: 'S' }, // S
        { shape: [[0, 1, 1], [1, 1, 0]], color: '#f00000', name: 'Z' }, // Z
        { shape: [[1, 0, 0], [1, 1, 1]], color: '#f0a000', name: 'L' }, // L
        { shape: [[0, 0, 1], [1, 1, 1]], color: '#0000f0', name: 'J' }  // J
    ];

    // Генерация перемешанной очереди фигур
    generatePieceQueue() {
        const pieces = [...this.PIECES];
        // Перемешивание массива (алгоритм Фишера-Йетса)
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        return pieces;
    }

    getNextPiece() {
        if (this.pieceQueue.length === 0) {
            this.pieceQueue = this.generatePieceQueue();
        }

        const pieceData = this.pieceQueue.shift();
        const piece = JSON.parse(JSON.stringify(pieceData));
        piece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2);
        piece.y = 0;
        return piece;
    }

    // Функция удержания фигуры
    hold() {
        if (!this.canHold || this.isPaused || this.gameOver) return;

        if (this.holdPiece === null) {
            // Первое удержание - просто сохраняем текущую фигуру и берем следующую
            this.holdPiece = JSON.parse(JSON.stringify(this.currentPiece));
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getNextPiece();
        } else {
            // Меняем местами текущую фигуру и удержанную
            const temp = JSON.parse(JSON.stringify(this.currentPiece));
            this.currentPiece = JSON.parse(JSON.stringify(this.holdPiece));
            this.holdPiece = temp;

            // Сбрасываем позицию текущей фигуры
            this.currentPiece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
            this.currentPiece.y = 0;
        }

        // После удержания нельзя снова удерживать до следующего хода
        this.canHold = false;

        // Проверяем коллизию после удержания
        if (this.collide()) {
            this.gameOver = true;
            this.endGame();
        }

        // Обновляем отображение удержанной фигуры
        this.drawHoldPiece();
    }

    // Получение позиции тени фигуры
    getShadowPosition() {
        const shadow = JSON.parse(JSON.stringify(this.currentPiece));
        shadow.y = this.currentPiece.y;

        // Опускаем фигуру до столкновения
        while (!this.collide(shadow)) {
            shadow.y++;
        }
        shadow.y--; // Возвращаем на одну позицию выше столкновения

        return shadow;
    }

    draw() {
        // Очистка canvas
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Отрисовка стакана
        this.ctx.strokeStyle = '#4ecca3';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.BOARD_WIDTH * this.BLOCK_SIZE,
            this.BOARD_HEIGHT * this.BLOCK_SIZE);

        // Отрисовка фигур на доске
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = value;
                    this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE,
                        this.BLOCK_SIZE, this.BLOCK_SIZE);
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE,
                        this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            });
        });

        // Отрисовка тени текущей фигуры
        if (!this.isPaused && !this.gameOver) {
            this.drawShadow(this.ctx, this.getShadowPosition());
        }

        // Отрисовка текущей фигуры
        this.drawPiece(this.ctx, this.currentPiece);

        // Отрисовка следующей фигуры
        this.drawNextPiece();

        // Отрисовка удержанной фигуры
        this.drawHoldPiece();
    }

    drawShadow(ctx, shadow) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        shadow.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect(
                        (shadow.x + x) * this.BLOCK_SIZE,
                        (shadow.y + y) * this.BLOCK_SIZE,
                        this.BLOCK_SIZE, this.BLOCK_SIZE
                    );
                }
            });
        });
    }

    drawPiece(ctx, piece, offsetX = 0, offsetY = 0) {
        ctx.fillStyle = piece.color;
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect(
                        (piece.x + x) * this.BLOCK_SIZE + offsetX,
                        (piece.y + y) * this.BLOCK_SIZE + offsetY,
                        this.BLOCK_SIZE, this.BLOCK_SIZE
                    );
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect(
                        (piece.x + x) * this.BLOCK_SIZE + offsetX,
                        (piece.y + y) * this.BLOCK_SIZE + offsetY,
                        this.BLOCK_SIZE, this.BLOCK_SIZE
                    );
                }
            });
        });
    }

    drawNextPiece() {
        // Очистка canvas для следующей фигуры
        this.nextCtx.fillStyle = '#0f3460';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        // Центрирование следующей фигуры в окне предпросмотра
        const piece = this.nextPiece;
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - piece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - piece.shape.length * blockSize) / 2;

        this.nextCtx.fillStyle = piece.color;
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize, blockSize
                    );
                    this.nextCtx.strokeStyle = '#fff';
                    this.nextCtx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize, blockSize
                    );
                }
            });
        });
    }

    drawHoldPiece() {
        if (!this.holdCtx) return;

        // Очистка canvas для удержанной фигуры
        this.holdCtx.fillStyle = '#0f3460';
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);

        if (this.holdPiece) {
            // Центрирование удержанной фигуры в окне
            const piece = this.holdPiece;
            const blockSize = 20;
            const offsetX = (this.holdCanvas.width - piece.shape[0].length * blockSize) / 2;
            const offsetY = (this.holdCanvas.height - piece.shape.length * blockSize) / 2;

            this.holdCtx.fillStyle = piece.color;
            piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.holdCtx.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize, blockSize
                        );
                        this.holdCtx.strokeStyle = '#fff';
                        this.holdCtx.strokeRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize, blockSize
                        );
                    }
                });
            });
        }
    }

    collide(piece = this.currentPiece) {
        return piece.shape.some((row, y) => {
            return row.some((value, x) => {
                if (value === 0) return false;

                const newX = piece.x + x;
                const newY = piece.y + y;

                return newX < 0 || newX >= this.BOARD_WIDTH ||
                    newY >= this.BOARD_HEIGHT ||
                    (newY >= 0 && this.board[newY][newX]);
            });
        });
    }

    merge() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][this.currentPiece.x + x] = this.currentPiece.color;
                    }
                }
            });
        });
    }

    rotate() {
        const rotated = [];
        const piece = this.currentPiece.shape;

        // Транспонирование матрицы
        for (let i = 0; i < piece[0].length; i++) {
            rotated[i] = [];
            for (let j = 0; j < piece.length; j++) {
                rotated[i][j] = piece[piece.length - 1 - j][i];
            }
        }


        const originalShape = this.currentPiece.shape;
        const originalX = this.currentPiece.x;

        this.currentPiece.shape = rotated;

        // Коррекция позиции при коллизии
        if (this.collide()) {
            // Пробуем сдвинуть влево
            let offset = 1;
            while (offset <= 2) { // Пробуем сдвинуть до 2 клеток
                this.currentPiece.x -= offset;
                if (!this.collide()) return;

                this.currentPiece.x = originalX + offset;
                if (!this.collide()) return;

                this.currentPiece.x = originalX;
                offset++;
            }

            // Если не помогло - откат
            this.currentPiece.shape = originalShape;
        }
    }

    move(dir) {
        this.currentPiece.x += dir;
        if (this.collide()) {
            this.currentPiece.x -= dir;
        }
    }

    drop() {
        this.currentPiece.y++;
        if (this.collide()) {
            this.currentPiece.y--;
            this.merge();
            this.clearLines();
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getNextPiece();
            this.canHold = true; // Разрешаем удержание после следующего хода

            if (this.collide()) {
                this.gameOver = true;
                this.endGame();
            }
        }
        this.dropCounter = 0;
    }

    hardDrop() {
        const shadow = this.getShadowPosition();
        this.currentPiece.y = shadow.y;
        this.drop();
    }

    clearLines() {
        let linesCleared = 0;

        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(value => value !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += [0, 40, 100, 300, 1200][linesCleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);

            this.updateUI();
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (this.isPaused || this.gameOver) return;

            switch(event.key) {
                case 'ArrowLeft':
                    this.move(-1);
                    break;
                case 'ArrowRight':
                    this.move(1);
                    break;
                case 'ArrowDown':
                    this.drop();
                    break;
                case 'ArrowUp':
                    this.rotate();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
                case 'p':
                case 'P':
                    this.pauseGame();
                    break;
                case 'c':
                case 'C':
                    this.hold();
                    break;
            }
        });
    }

    gameLoop(time = 0) {
        if (this.gameOver) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        if (!this.isPaused) {
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
            }
        }

        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    pauseGame() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pause-btn');
        btn.textContent = this.isPaused ? 'Продолжить' : 'Пауза';
    }

    endGame() {
        this.saveHighscore();
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }

    saveHighscore() {
        const highscores = JSON.parse(localStorage.getItem('tetris.highscores') || '[]');

        highscores.push({
            name: this.playerName,
            score: this.score,
            level: this.level,
            lines: this.lines,
            date: new Date().toLocaleDateString()
        });

        // Сортировка по убыванию очков
        highscores.sort((a, b) => b.score - a.score);

        // Сохранение только топ-10 результатов
        localStorage.setItem('tetris.highscores', JSON.stringify(highscores.slice(0, 10)));
    }
}

// Глобальные функции для управления игрой
let tetris;

function startGame() {
    tetris = new Tetris();
}

function restartGame() {
    // Скрываем все модальные окна
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('highscores-modal').classList.add('hidden');

    // Полностью пересоздаем игру
    tetris = new Tetris();
}

function showHighscores() {
    const highscores = JSON.parse(localStorage.getItem('tetris.highscores') || '[]');

    let highscoresHTML = '<h2>Таблица рекордов</h2>';
    if (highscores.length === 0) {
        highscoresHTML += '<p>Рекордов пока нет</p>';
    } else {
        highscoresHTML += '<ol>';
        highscores.forEach((record, index) => {
            highscoresHTML += `
                <li>
                    ${record.name} - ${record.score} очков 
                    (Уровень: ${record.level}, Линии: ${record.lines})
                    <br><small>${record.date}</small>
                </li>
            `;
        });
        highscoresHTML += '</ol>';
    }

    // Добавляем кнопки "Новая игра" и "Закрыть"
    highscoresHTML += `
        <div style="margin-top: 20px;">
            <button onclick="restartGame()">Новая игра</button>
            <button onclick="closeHighscores()">Закрыть</button>
        </div>
    `;

    const modal = document.getElementById('highscores-modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = highscoresHTML;
    modal.classList.remove('hidden');
}

function closeHighscores() {
    document.getElementById('highscores-modal').classList.add('hidden');

    // Если игра окончена, показываем окно завершения игры
    if (tetris && tetris.gameOver) {
        document.getElementById('game-over').classList.remove('hidden');
    }
}

function pauseGame() {
    if (tetris) {
        tetris.pauseGame();
    }
}

// Запуск игры при загрузке страницы
window.onload = startGame;