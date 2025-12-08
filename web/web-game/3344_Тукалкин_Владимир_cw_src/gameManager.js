let CONSTS = {
    // Прыжок
    DOUBLE_JUMP: {
        ENABLE: false,
        MAX_JUMPS: 2,
        SECOND_JUMP_FORCE: 10
    },

    // Скорость персонажа
    PLAYER_SPEED: {
        NORMAL: 2.5,
        RUN: 3.0
    },

    // Скорость врага
    ENEMY_SPEED: {
        NORMAL: 0.8,
        RUN: 2.0
    },

    // Пули
    BULLET: {
        SPEED: 12,
        LIFETIME: 90,
        SIZE: {x: 16, y: 8},
        DAMAGE: 20,
        DEBUG: false,
        AUTO_AIM: false
    },

    // Характеристики
    STATS: {
        PLAYER_HEALTH: 100,
        PLAYER_MAX_HEALTH: 100,
        PLAYER_DAMAGE: 50,
        ENEMY_HEALTH: 100,
        ENEMY_DAMAGE: 20,
        ENABLE_REGEN: false,
        HEALTH_REGEN: 10
    },

    // Прыжок и физика
    PHYSICS: {
        GRAVITY: 0.3,
        JUMP_VELOCITY: 10,
        TERMINAL_VELOCITY: 15
    },

    // Управление мышью
    MOUSE: {
        TELEPORT_ENABLED: false,          // Включить телепорт по клику
        TELEPORT_KEY: 'Shift',           // Клавиша-модификатор (должна быть зажата)
        TELEPORT_COOLDOWN: 120,          // Кулдаун в кадрах (2 секунды)
        TELEPORT_RANGE: 500,             // Максимальная дистанция телепорта

        PICKUP_ENABLED: false,            // Подбор бонусов мышкой
        PICKUP_RADIUS: 150,              // Радиус подбора
        PICKUP_AUTO: false,               // Автоматический подбор при наведении
        PICKUP_CLICK: true,              // Подбор по клику

        SHOW_DEBUG_INFO: false           // Показывать отладочную информацию
    },

    // Уровни
    LEVEL: {
        TONEXTLEVEL: false,
        TOMENU: false,
        AUTOREPEAT: false,
        INSTANT_COMPLETE: false,
        INSTANT_KEY: 'F3',
    },

    // Коллизии
    COLLISION: {
        ENABLED: true,
        DEBUG: false,
        TILE_SIZE: 32,
        WALL_INDICES: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
            61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
            91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120
        ],
        SHOW_HITBOXES: false,
        ENTITY_COLLISION: false
    },

    // Атака
    ATTACK: {
        DEBUG: false,
        RANGE: 60,
        ENEMY_RANGE: 60,
        KNOCKBACK: 5,
        COOLDOWN: 20,
        BOX_SIZE: {w: 40, h: 30}
    },

    // Игровой цикл
    GAME_LOOP: {
        FPS: 60,
        SHOW_FPS: false
    },

    // Авто-стрельба
    AUTOSHOT: {
        SHOOT_ENABLED: false,
        SHOOT_INTERVAL: 10,
        RELOAD_WHEN_EMPTY: true
    },

    // Пауза
    PAUSE: {
        ENABLED: false,
        SLOW_MOTION: false,
        SLOW_FACTOR: 0.5,
        PAUSE_KEY: 'P'
    },

    // Звук
    SOUND: {
        ENABLED: false,
        VOLUME: 0.7,
        MUTE_KEY: 'M'
    },

    // Цвета
    COLORS: {
        PLAYER: '#00b4d8',
        ENEMY: '#ff4444',
        BULLET: '#FFD700',
        HEALTH_BAR: '#4CAF50',
        DEBUG: '#00FF00'
    }
};

var gameManager = {
    factory: {},
    entities: [],
    player: null,
    laterKill: [],
    ctx: null,
    gameState: "MENU",
    frameCount: 0,
    score: 0,
    currentLevel: 1,
    totalEnemies: 0,
    levelScoreBonus: 0,
    _animationId: null,
    _uiInterval: null,
    _isInitialized: false,

    // FPS управление
    targetFPS: CONSTS.GAME_LOOP.FPS,
    frameTime: 1000 / CONSTS.GAME_LOOP.FPS,
    lastFrameTime: 0,
    fps: 0,
    fpsFrameCount: 0,
    fpsTimer: 0,

    // Управление
    isPaused: false,
    timeScale: 1.0,

    // Состояние мыши
    mouseState: {
        teleportReady: false,
        teleportCooldown: 0,
        lastTeleportTime: 0,
        pickupActive: false,
        lastMousePos: {x: 0, y: 0}
    },

    // Точка входа
    startGame: function (level) {
        console.log(`Начало новой игры, уровень ${level}`);
        this.currentLevel = level;
        this.score = 0;

        // Сброс состояния мыши
        this.mouseState = {
            teleportReady: true,
            teleportCooldown: 0,
            lastTeleportTime: 0,
            pickupActive: false,
            lastMousePos: {x: 0, y: 0}
        };

        this.showScreen('loading-screen');

        setTimeout(() => {
            const canvas = document.getElementById('game-canvas');
            this.ctx = canvas.getContext('2d');

            if (!this._isInitialized) {
                this.init();
                this._isInitialized = true;
            }

            this.updateFPSFromConsts();
            this.loadLevel(level);

        }, 300);
    },

    restartLevel: function () {
        console.log('Перезапуск уровня');
        this.score = 0;
        this.showScreen('loading-screen');

        // Сброс состояния мыши
        this.mouseState.teleportReady = true;
        this.mouseState.teleportCooldown = 0;

        setTimeout(() => {
            this.loadLevel(this.currentLevel);
        }, 300);
    },

    nextLevel: function () {
        console.log('Следующий уровень');
        this.score = 0;
        let nextLevel = this.currentLevel + 1;

        if (nextLevel > 2) {
            console.log('Игра пройдена!');
            this.showGameCompleteScreen();
            return;
        }

        this.showScreen('loading-screen');

        setTimeout(() => {
            this.currentLevel = nextLevel;
            this.loadLevel(nextLevel);
        }, 300);
    },

    returnToMenu: function () {
        console.log('Возврат в меню');
        this.stopGame();
        this.gameState = "MENU";
        this.showScreen('main-menu');
    },

    init: function () {
        console.log("Инициализация gameManager");

        this.factory["Player"] = Player;
        this.factory["Enemy"] = Enemy;
        this.factory["Bullet"] = Bullet;

        soundManager.init();

        soundManager.loadArray([
            "sound/coin.mp3",
            "sound/enemy_dead.mp3",
            "sound/enemy_hurt.mp3",
            "sound/lose.mp3",
            "sound/player_dead.mp3",
            "sound/player_hurt.mp3",
            "sound/shot.mp3",
            "sound/win.mp3",
            "sound/background.mp3"
        ]);
        this.score = 0;

        spriteManager.loadAtlas();
    },

    loadLevel: function (level) {
        console.log(`Загрузка уровня ${level}, текущий счет: ${this.score}`);

        this.stopGame();

        this.entities = [];
        this.player = null;
        this.laterKill = [];
        this.gameState = "LOADING";
        this.totalEnemies = 0;
        this.levelScoreBonus = 0;
        this.frameCount = 0;

        this.fps = 0;
        this.fpsFrameCount = 0;
        this.fpsTimer = 0;
        this.lastFrameTime = 0;

        // Сброс состояния мыши
        this.mouseState.teleportReady = true;
        this.mouseState.teleportCooldown = 0;

        mapManager.reset();

        if (eventsManager) {
            eventsManager.action = {};
            eventsManager.lastDirection = 0;
            eventsManager.facing = 1;
        }

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        let mapPath = level === 1 ? "maps/level_1.json" : "maps/level_2.json";
        console.log(`Загрузка карты: ${mapPath}`);
        mapManager.loadMap(mapPath);

        eventsManager.setup(this.ctx.canvas);

        this.waitForLoad();
    },

    waitForLoad: function () {
        console.log("Ожидание загрузки ресурсов...");

        const check = () => {
            let spritesLoaded = spriteManager.imgLoaded;
            let mapLoaded = mapManager.imgLoaded && mapManager.jsonLoaded;

            console.log(`Загрузка: спрайты=${spritesLoaded}, карта=${mapLoaded}`);

            if (spritesLoaded && mapLoaded) {
                console.log("Все ресурсы загружены");
                this.gameState = "PLAYING";

                this.totalEnemies = this.countEnemies();
                console.log(`Врагов на уровне: ${this.totalEnemies}`);

                soundManager.play("sound/background.mp3", {looping: true, volume: 0.3});

                this.showScreen('game-container');
                this.startGameLoop();
                this.startUIUpdate();

            } else {
                setTimeout(check, 100);
            }
        };

        check();
    },

    startGameLoop: function () {
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
        }

        this.lastFrameTime = performance.now();

        const gameLoop = (currentTime) => {
            if (this.isPaused) {
                this._animationId = requestAnimationFrame(gameLoop);
                return;
            }

            if (this.gameState !== "PLAYING") {
                this._animationId = requestAnimationFrame(gameLoop);
                return;
            }

            const deltaTime = currentTime - this.lastFrameTime;

            if (deltaTime >= this.frameTime) {
                this.lastFrameTime = currentTime - (deltaTime % this.frameTime);

                this.updateFPSCounter(deltaTime);
                this.update();
                this.draw();

                if (CONSTS.GAME_LOOP.SHOW_FPS && this.ctx) {
                    this.drawFPS();
                }
            }

            this._animationId = requestAnimationFrame(gameLoop);
        };

        this._animationId = requestAnimationFrame(gameLoop);
        console.log(`Игровой цикл запущен (FPS: ${this.targetFPS})`);
    },

    updateFPSCounter: function (deltaTime) {
        this.fpsFrameCount++;
        this.fpsTimer += deltaTime;

        if (this.fpsTimer >= 1000) {
            this.fps = Math.round((this.fpsFrameCount * 1000) / this.fpsTimer);
            this.fpsFrameCount = 0;
            this.fpsTimer = 0;

            if (CONSTS.GAME_LOOP.SHOW_FPS) {
                console.log(`FPS: ${this.fps} (цель: ${this.targetFPS})`);
            }
        }
    },

    updateFPSFromConsts: function () {
        if (CONSTS && CONSTS.GAME_LOOP && CONSTS.GAME_LOOP.FPS) {
            this.targetFPS = Math.max(1, Math.min(CONSTS.GAME_LOOP.FPS, 240));
            this.frameTime = 1000 / this.targetFPS;
            console.log(`FPS установлен: ${this.targetFPS} (${this.frameTime.toFixed(2)}мс на кадр)`);
            return true;
        }
        console.warn("CONSTS.GAME_LOOP.FPS не найден, используется значение по умолчанию: 60");
        this.targetFPS = 60;
        this.frameTime = 1000 / 60;
        return false;
    },

    setFPS: function (newFPS) {
        this.targetFPS = Math.max(1, Math.min(newFPS, 240));
        this.frameTime = 1000 / this.targetFPS;

        if (CONSTS && CONSTS.GAME_LOOP) {
            CONSTS.GAME_LOOP.FPS = this.targetFPS;
        }

        console.log(`FPS изменен на: ${this.targetFPS} (${this.frameTime.toFixed(2)}мс на кадр)`);
    },

    setTimeScale: function (scale) {
        this.timeScale = Math.max(0.1, Math.min(scale, 5.0));
        console.log(`Скорость игры: x${this.timeScale.toFixed(1)}`);
    },

    togglePause: function () {
        if (CONSTS.PAUSE.SLOW_MOTION && !this.isPaused) {
            this.timeScale = CONSTS.PAUSE.SLOW_FACTOR;
            console.log(`Замедление включено (x${CONSTS.PAUSE.SLOW_FACTOR})`);
        } else {
            this.isPaused = !this.isPaused;
            this.timeScale = 1.0;
            console.log(`Игра ${this.isPaused ? 'на паузе' : 'возобновлена'}`);

            if (soundManager && soundManager.context) {
                if (this.isPaused) {
                    soundManager.context.suspend();
                } else {
                    soundManager.context.resume();
                }
            }
        }
    },

    toggleMute: function () {
        if (soundManager && soundManager.gainNode) {
            const currentVolume = soundManager.gainNode.gain.value;
            if (currentVolume > 0) {
                soundManager.gainNode.gain.value = 0;
                console.log('Звук выключен');
            } else {
                soundManager.gainNode.gain.value = CONSTS.SOUND.VOLUME || 0.7;
                console.log('Звук включен');
            }
        }
    },

    update: function () {
        this.frameCount++;

        // Обновление кулдауна телепорта
        if (this.mouseState.teleportCooldown > 0) {
            this.mouseState.teleportCooldown--;
        } else {
            this.mouseState.teleportReady = true;
        }

        // Подбор бонусов мышкой (автоматический)
        if (CONSTS.MOUSE.PICKUP_ENABLED && CONSTS.MOUSE.PICKUP_AUTO && this.player && this.player.isAlive) {
            this.pickupCoinsWithMouse();
        }

        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i] && this.entities[i].update) {
                try {
                    this.entities[i].update();
                } catch (e) {
                    console.error("Ошибка обновления:", e);
                }
            }
        }

        if (CONSTS.COLLISION.ENTITY_COLLISION) {
            this.checkEntityCollisions();
        }

        if (this.player && mapManager) {
            mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        }

        this.processKills();
        this.checkGameConditions();
    },

    draw: function () {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        if (mapManager.imgLoaded && mapManager.jsonLoaded) {
            mapManager.draw(this.ctx);
        }

        for (let e = 0; e < this.entities.length; e++) {
            if (this.entities[e] && this.entities[e].draw) {
                this.entities[e].draw(this.ctx);
            }
        }

        // Информация по уровню
        this.drawLevelInfo();

        // Отладочная информация о состоянии мыши
        if (CONSTS.MOUSE.SHOW_DEBUG_INFO && this.player) {
            this.drawMouseDebugInfo();
        }
    },

    drawMouseDebugInfo: function () {
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(10, 90, 250, 60);

        this.ctx.fillStyle = "white";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "left";

        this.ctx.fillText(`Телепорт: ${this.mouseState.teleportReady ? 'Готов' : `Кулдаун: ${this.mouseState.teleportCooldown}`}`, 20, 110);
        this.ctx.fillText(`Мышка: X=${eventsManager.mousePos.x}, Y=${eventsManager.mousePos.y}`, 20, 130);
        this.ctx.fillText(`Клик: ${eventsManager.click.pressed ? 'Да' : 'Нет'}`, 20, 150);

        this.ctx.restore();
    },

    drawFPS: function () {
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(this.ctx.canvas.width - 100, 10, 90, 40);

        let color;
        if (this.fps >= this.targetFPS * 0.9) color = "#00FF00";
        else if (this.fps >= this.targetFPS * 0.6) color = "#FFFF00";
        else color = "#FF0000";

        this.ctx.fillStyle = color;
        this.ctx.font = "bold 14px Arial";
        this.ctx.textAlign = "right";
        this.ctx.fillText(`FPS: ${this.fps}`, this.ctx.canvas.width - 15, 30);
        this.ctx.fillText(`Цель: ${this.targetFPS}`, this.ctx.canvas.width - 15, 45);

        this.ctx.restore();
    },

    drawLevelInfo: function () {
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(10, 10, 250, 70);

        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 16px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Уровень: ${this.currentLevel}`, 20, 30);

        let enemiesLeft = this.getEnemiesCount();
        this.ctx.fillText(`Врагов: ${enemiesLeft}/${this.totalEnemies}`, 20, 50);

        if (this.player && this.player.isAlive) {
            let healthBonus = Math.floor(this.player.health);
            this.ctx.fillText(`Бонус: +${healthBonus}`, 20, 70);
        }

        this.ctx.restore();
    },

    // Функция подбора бонусов мышкой
    pickupCoinsWithMouse: function () {
        if (!this.player || !this.player.isAlive || !mapManager.tLayer || !mapManager.tLayer.data) return;

        const mouseX = eventsManager.mousePos.x + mapManager.view.x;
        const mouseY = eventsManager.mousePos.y + mapManager.view.y;

        // Идентификаторы монеток (пример - нужно уточнить по вашей карте)
        const coinTileIds = [12, 13, 14]; // Примерные ID тайлов монет

        const pickupRadius = CONSTS.MOUSE.PICKUP_RADIUS;
        const tileSize = mapManager.tSize.x;

        // Определяем область поиска вокруг курсора
        const searchLeft = Math.max(0, Math.floor((mouseX - pickupRadius) / tileSize));
        const searchRight = Math.min(mapManager.xCount - 1, Math.floor((mouseX + pickupRadius) / tileSize));
        const searchTop = Math.max(0, Math.floor((mouseY - pickupRadius) / tileSize));
        const searchBottom = Math.min(mapManager.yCount - 1, Math.floor((mouseY + pickupRadius) / tileSize));

        let coinsCollected = 0;

        for (let y = searchTop; y <= searchBottom; y++) {
            for (let x = searchLeft; x <= searchRight; x++) {
                const tileIndex = y * mapManager.xCount + x;
                const tileId = mapManager.tLayer.data[tileIndex];

                if (tileId === 0 || !coinTileIds.includes(tileId)) continue;

                // Проверяем расстояние от курсора до центра тайла
                const tileCenterX = x * tileSize + tileSize / 2;
                const tileCenterY = y * tileSize + tileSize / 2;

                const distance = Math.sqrt(
                    Math.pow(mouseX - tileCenterX, 2) +
                    Math.pow(mouseY - tileCenterY, 2)
                );

                if (distance <= pickupRadius) {
                    // Собираем монету
                    mapManager.tLayer.data[tileIndex] = 0;
                    coinsCollected++;

                    // Звук сбора монеты
                    soundManager.play("sound/coin.mp3", {volume: 0.5});

                    console.log(`Монета собрана мышкой! (${x}, ${y})`);
                }
            }
        }

        if (coinsCollected > 0) {
            this.score += coinsCollected * 100;
            console.log(`Собрано монет мышкой: ${coinsCollected}, новый счет: ${this.score}`);
            this.updateUI();
        }
    },

    checkWallAtPosition: function(x, y, width, height) {
        // Проверяем 4 угла хитбокса
        const points = [
            {x: x, y: y},
            {x: x + width, y: y},
            {x: x, y: y + height},
            {x: x + width, y: y + height}
        ];

        for (let point of points) {
            const tileIndex = mapManager.getTilesetIdx(point.x, point.y);
            if (tileIndex !== 0 && mapManager.wallIndices.includes(tileIndex)) {
                return true;
            }
        }

        return false;
    },

    checkGameConditions: function () {
        if (this.gameState !== "PLAYING") return;

        if (this.player && !this.player.isAlive) {
            if (CONSTS.LEVEL.AUTOREPEAT) {
                this.restartLevel();
            }
            if (CONSTS.LEVEL.TOMENU) {
                this.returnToMenu();
            }
            console.log("Игрок погиб!");
            this.gameState = "GAME_OVER";
            soundManager.play("sound/lose.mp3", {volume: 0.8});
            this.showLoseScreen();
            return;
        }

        let enemiesLeft = this.getEnemiesCount();
        if (eventsManager.action[CONSTS.LEVEL.INSTANT_KEY] || (enemiesLeft === 0 && this.totalEnemies > 0)) {
            if (CONSTS.LEVEL.AUTOREPEAT) {
                this.restartLevel();
            }
            if (CONSTS.LEVEL.TOMENU) {
                this.returnToMenu();
            }
            if (CONSTS.LEVEL.TONEXTLEVEL) {
                this.nextLevel();
            }
            if (!CONSTS.LEVEL.TOMENU && !CONSTS.LEVEL.TONEXTLEVEL && !CONSTS.LEVEL.TOMENU) {
                console.log("Уровень пройден!");

                if (this.player && this.player.isAlive) {
                    this.levelScoreBonus = Math.floor(this.player.health);
                    this.score += this.levelScoreBonus;
                    console.log(`Бонус за здоровье: +${this.levelScoreBonus}, общий счет: ${this.score}`);
                }

                this.gameState = "LEVEL_COMPLETE";
                soundManager.play("sound/win.mp3", {volume: 0.8});
                this.showWinScreen();
            }
        }
    },

    getEnemiesCount: function () {
        let count = 0;
        for (let i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i];
            if (entity !== this.player && entity.isAlive &&
                entity.characterName && entity.characterName !== "Soldier") {
                count++;
            }
        }
        return count;
    },

    countEnemies: function () {
        let count = 0;
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i] !== this.player &&
                this.entities[i].characterName &&
                this.entities[i].characterName !== "Soldier") {
                count++;
            }
        }
        return count;
    },

    processKills: function () {
        if (this.laterKill.length > 0) {
            for (let i = 0; i < this.laterKill.length; i++) {
                let obj = this.laterKill[i];
                let idx = this.entities.indexOf(obj);
                if (idx !== -1) {
                    this.entities.splice(idx, 1);
                }
            }
            this.laterKill = [];
        }
    },

    startUIUpdate: function () {
        if (this._uiInterval) {
            clearInterval(this._uiInterval);
        }

        this._uiInterval = setInterval(() => {
            this.updateUI();
        }, 100);
    },

    updateUI: function () {
        // Здоровье
        if (this.player) {
            const health = Math.max(0, this.player.health || 100);
            const healthFill = document.getElementById('health-fill');
            const healthText = document.getElementById('health-text');

            if (healthFill && healthText) {
                const percent = Math.min(100, health);
                healthFill.style.width = `${percent}%`;
                healthText.textContent = `${Math.floor(health)} HP`;

                if (percent > 70) {
                    healthFill.style.background = 'linear-gradient(90deg, #00ff00, #88ff00)';
                } else if (percent > 30) {
                    healthFill.style.background = 'linear-gradient(90deg, #ff8800, #ffaa00)';
                } else {
                    healthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff5500)';
                }
            }
        }

        // Очки
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }

        // Враги
        const enemiesDisplay = document.getElementById('enemies-display');
        if (enemiesDisplay) {
            enemiesDisplay.textContent = this.getEnemiesCount();
        }

        // Патроны
        const ammoDisplay = document.getElementById('ammo-display');
        if (ammoDisplay && this.player && this.player.bullets !== undefined) {
            ammoDisplay.textContent = this.player.bullets;
        }
    },

    showWinScreen: function () {
        this.stopGame();

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.currentLevel;

        if (this.player) {
            const health = Math.max(0, Math.floor(this.player.health));
            document.getElementById('final-health').textContent = health;

            let bonusElem = document.getElementById('health-bonus');
            if (!bonusElem) {
                const stats = document.getElementById('win-stats');
                bonusElem = document.createElement('div');
                bonusElem.id = 'health-bonus';
                stats.appendChild(bonusElem);
            }
            bonusElem.innerHTML = `Бонус за здоровье: <span style="color: #4CAF50; font-weight: bold;">+${this.levelScoreBonus || 0}</span>`;
        }

        const nextBtn = document.getElementById('next-level-btn');
        if (this.currentLevel < 2) {
            nextBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'none';
        }

        this.showScreen('win-screen');
    },

    showLoseScreen: function () {
        this.stopGame();

        document.getElementById('lose-score').textContent = this.score;
        document.getElementById('lose-enemies').textContent = this.getEnemiesCount();

        this.showScreen('lose-screen');
    },

    showGameCompleteScreen: function () {
        this.stopGame();

        let completeScreen = document.getElementById('complete-screen');
        if (!completeScreen) {
            completeScreen = document.createElement('div');
            completeScreen.id = 'complete-screen';
            completeScreen.className = 'hidden';
            completeScreen.innerHTML = `
                <div class="win-content">
                    <h2 style="color: #FFD700;">ИГРА ПРОЙДЕНА!</h2>
                    <div style="margin: 25px 0; font-size: 1.1em;">
                        <div>Финальный счет: <span style="color: #FFD700; font-weight: bold;">${this.score}</span></div>
                        <div>Все уровни пройдены!</div>
                    </div>
                    <div class="win-buttons">
                        <button class="menu-btn">В МЕНЮ</button>
                    </div>
                </div>
            `;
            document.body.appendChild(completeScreen);

            completeScreen.addEventListener('click', function (e) {
                if (e.target.classList.contains('menu-btn')) {
                    gameManager.returnToMenu();
                }
            });
        } else {
            completeScreen.querySelector('span').textContent = this.score;
        }

        this.showScreen('complete-screen');
    },

    showScreen: function (screenId) {
        console.log(`Показ экрана: ${screenId}`);

        const screens = ['main-menu', 'game-container', 'loading-screen', 'win-screen', 'lose-screen', 'complete-screen'];
        screens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) {
                screen.classList.add('hidden');
            }
        });

        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        }
    },

    stopGame: function () {
        console.log("Остановка игры");
        this.gameState = "STOPPED";
        this.isPaused = false;
        this.timeScale = 1.0;

        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }

        if (this._uiInterval) {
            clearInterval(this._uiInterval);
            this._uiInterval = null;
        }

        if (window.soundManager) {
            soundManager.stopAll();
        }

        if (eventsManager) {
            eventsManager.action = {};
            eventsManager.lastDirection = 0;
            eventsManager.facing = 1;
        }
    },

    initPlayer: function (obj) {
        this.player = obj;
        console.log("Игрок создан");
    },

    checkEntityCollisions: function () {
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                let entityA = this.entities[i];
                let entityB = this.entities[j];

                if (!entityA.isAlive || !entityB.isAlive) continue;

                if (entityA.constructor === Bullet || entityB.constructor === Bullet) continue;

                if (physicsManager.checkEntityCollision(entityA, entityB)) {
                    physicsManager.resolveEntityCollision(entityA, entityB);
                }
            }
        }
    },
};

// Глобальные функции
window.setGameFPS = function (fps) {
    if (gameManager) {
        gameManager.setFPS(fps);
    }
};

window.setGameSpeed = function (speed) {
    if (gameManager) {
        gameManager.setTimeScale(speed);
    }
};

window.toggleGamePause = function () {
    if (gameManager) {
        gameManager.togglePause();
    }
};

window.toggleGameMute = function () {
    if (gameManager) {
        gameManager.toggleMute();
    }
};

window.teleportPlayer = function (x, y) {
    if (gameManager && gameManager.player) {
        gameManager.player.pos_x = x;
        gameManager.player.pos_y = y;
        console.log(`Игрок телепортирован в (${x}, ${y})`);
    }
};