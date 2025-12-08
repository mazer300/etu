let eventsManager = {
    bind: [],
    action: [],
    facing: 1,
    lastDirection: 0,
    canvas: null,
    mousePos: {x: 0, y: 0},
    click: {x: null, y: null, pressed: false},

    setup: function (canvas) {
        this.canvas = canvas;
        this.bind[32] = 'up'; // Space
        this.bind[65] = 'left'; // A
        this.bind[68] = 'right'; // D
        this.bind[69] = 'attack'; // E
        this.bind[82] = 'reload'; // R
        this.bind[39] = 'shot'; // ->
        this.bind[16] = 'run'; // Shift (ТЕПЕРЬ И ДЛЯ ТЕЛЕПОРТА)
        this.bind[27] = 'menu'; // esc

        document.body.addEventListener("keydown", this.onKeyDown.bind(this));
        document.body.addEventListener("keyup", this.onKeyUp.bind(this));

        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));

        this.canvas.addEventListener("contextmenu", this.onContextMenu);

        // Добавляем подсказку для мыши
        this.canvas.title = "Shift+ЛКМ - телепорт, Shift+наведение - подбор бонусов";
    },

    resetClick: function () {
        this.click.pressed = false;
        this.click.x = null;
        this.click.y = null;
    },

    onKeyDown: function (event) {
        let action = eventsManager.bind[event.keyCode];

        switch (event.keyCode) {
            case 80: // P - пауза
                if (gameManager && CONSTS.PAUSE.ENABLED) {
                    gameManager.togglePause();
                    event.preventDefault();
                }
                break;

            case 77: // M - мут звука
                if (gameManager && CONSTS.SOUND.ENABLED) {
                    gameManager.toggleMute();
                    event.preventDefault();
                }
                break;

            case 114: // F3 - мгновенный переход уровня
                if (CONSTS.LEVEL.INSTANT_COMPLETE && gameManager) {
                    eventsManager.action[CONSTS.LEVEL.INSTANT_KEY] = true;
                    event.preventDefault();
                }
                break;
        }

        if (action) {
            if (gameManager.gameState !== "PLAYING" &&
                ["attack", "shot", "up", "left", "right", "run", "reload"].includes(action)) {
                console.log("Игнорируем игровое действие вне состояния PLAYING");
                return;
            }

            eventsManager.action[action] = true;

            if (["up", "left", "right", "attack", "shot", "reload", "run"].includes(action)) {
                event.preventDefault();
            }

            if (action === "left") {
                eventsManager.facing = -1;
                eventsManager.lastDirection = -1;
            } else if (action === "right") {
                eventsManager.facing = 1;
                eventsManager.lastDirection = 1;
            }

            console.log("Key pressed:", action, "code:", event.keyCode, "gameState:", gameManager.gameState);
        }
    },

    onKeyUp: function (event) {
        let action = eventsManager.bind[event.keyCode];
        if (action) {
            eventsManager.action[action] = false;

            if (action === "left" && eventsManager.lastDirection === -1) {
                eventsManager.lastDirection = eventsManager.action["right"] ? 1 : 0;
            } else if (action === "right" && eventsManager.lastDirection === 1) {
                eventsManager.lastDirection = eventsManager.action["left"] ? -1 : 0;
            }
            eventsManager.facing = eventsManager.lastDirection !== 0 ? eventsManager.lastDirection : eventsManager.facing;

            console.log("Key released:", action);
        }
    },

    getMousePosition: function (evt) {
        let rect = this.canvas.getBoundingClientRect();
        return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
    },

    onMouseMove: function (event) {
        this.mousePos = this.getMousePosition(event);

        // Обработка автоматического подбора при наведении
        if (CONSTS.MOUSE.PICKUP_ENABLED && CONSTS.MOUSE.PICKUP_AUTO &&
            gameManager && gameManager.gameState === "PLAYING" &&
            gameManager.player && gameManager.player.isAlive &&
            eventsManager.action["run"]) { // Только при зажатом Shift

            // Запоминаем позицию для подбора
            this.lastMouseMoveTime = Date.now();
        }
    },

    onMouseDown: function (event) {
        this.mousePos = this.getMousePosition(event);
        this.click.x = this.mousePos.x;
        this.click.y = this.mousePos.y;
        this.click.pressed = true;

        if (gameManager.gameState !== "PLAYING") {
            console.log("Игнорируем клик вне состояния PLAYING");
            return;
        }

        if (gameManager.player && !gameManager.player.isAlive) return;

        if (event.button === 0) { // ЛКМ
            // ТЕЛЕПОРТ: Shift + ЛКМ
            if (eventsManager.action["run"] && CONSTS.MOUSE.TELEPORT_ENABLED) {
                console.log("Shift+ЛКМ: попытка телепорта");
                // Обработка телепорта будет в Player.move()
                eventsManager.action["teleport"] = true;
            }
            // СТРЕЛЬБА: обычная ЛКМ
            else {
                eventsManager.action["shot_mouse"] = true;
                console.log("ЛКМ нажата - выстрел");
            }
        } else if (event.button === 2) { // ПКМ
            eventsManager.action["attack"] = true;
            console.log("ПКМ нажата - атака");
        }
        event.preventDefault();
    },

    onMouseUp: function (event) {
        if (gameManager.gameState === "PLAYING") {
            if (event.button === 0) { // ЛКМ
                eventsManager.action["shot"] = false;
                eventsManager.action["shot_mouse"] = false;
                eventsManager.action["teleport"] = false;
            } else if (event.button === 2) { // ПКМ
                eventsManager.action["attack"] = false;
            }
        }
        // Сбрасываем клик через небольшое время, чтобы успела обработаться логика
        setTimeout(() => {
            this.click.pressed = false;
        }, 50);
    },

    onContextMenu: function (event) {
        event.preventDefault();
    }
};