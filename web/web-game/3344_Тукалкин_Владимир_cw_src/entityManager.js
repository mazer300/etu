var Entity = {
    pos_x: 0, pos_y: 0, // позиция объекта
    size_x: 0, size_y: 0, // размеры объекта
    extend: function (extendProto) { // расширение сущности
        var object = Object.create(this); // создание нового объекта
        for (var property in extendProto) { // для всех свойств нового объекта
            if (this.hasOwnProperty(property) || typeof object[property] === 'undefined') {
                // если свойства отсутствуют в родительском объекте, то добавляем
                object[property] = extendProto[property];
            }
        }
        return object;
    }
};

let Character = Entity.extend({
    speed_x: 0,
    speed_y: 0,
    baseSpeed: 1,
    animationFrame: 0,
    currentAnimation: "Idle",
    facing: 1,
    attackCooldown: 0,
    isAttacking: false,
    health: 100,
    isAlive: true,
    characterName: "Soldier",

    updateAttackAnimation: function () {
        if (!this.isAttacking) return;

        let animation_speed = 0.4;
        let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);

        let next_frame = this.animationFrame + animation_speed;
        if (next_frame >= sprite_data.frames.frame_count) {
            this.isAttacking = false;
            this.animationFrame = 0;
            this.currentAnimation = "Idle";
        } else {
            this.animationFrame = next_frame;
        }
    },

    getHitbox: function () {
        return {
            x: this.pos_x,
            y: this.pos_y,
            w: this.size_x,
            h: this.size_y,
        }
    },

    getAttackBox: function () {
        if (!this.isAttacking) return null;

        let attack_width = 40;
        let attack_height = this.size_y * 0.8;
        let attack_x = this.pos_x;
        let attack_y = this.pos_y + (this.size_y - attack_height) / 2;

        // Исправляем расчет позиции атаки
        if (this.facing === 1) {
            // Атака справа
            attack_x = this.pos_x + this.size_x;
        } else {
            // Атака слева
            attack_x = this.pos_x - attack_width;
        }

        return {
            x: attack_x,
            y: attack_y,
            w: attack_width,
            h: attack_height
        };
    },

    drawHitbox: function (ctx) {
        if (!CONSTS.COLLISION.SHOW_HITBOXES) return;

        let hitbox = this.getHitbox();
        if (!hitbox) return;

        let screenX = hitbox.x - mapManager.view.x;
        let screenY = hitbox.y - mapManager.view.y;

        ctx.save();
        ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, hitbox.w, hitbox.h);

        // Подпись
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText(this.characterName, screenX, screenY - 5);

        ctx.restore();
    },

    drawAttackBox: function (ctx) {
        if (!CONSTS.COLLISION.SHOW_HITBOXES) return;

        let attackBox = this.getAttackBox();
        if (!attackBox) return;

        let screenX = attackBox.x - mapManager.view.x;
        let screenY = attackBox.y - mapManager.view.y;

        ctx.save();
        ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, attackBox.w, attackBox.h);

        // Подпись
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText("АТАКА", screenX + attackBox.w / 2 - 15, screenY - 5);

        ctx.restore();
    },

    draw: function (ctx) {
        let frame_w = 128;
        let frame_h = 128;

        let offset_x = (this.size_x - frame_w) / 2;
        let offset_y = this.size_y - frame_h;

        let draw_x = this.pos_x + offset_x;
        let draw_y = this.pos_y + offset_y;

        spriteManager.drawSprite(ctx, this.characterName, this.currentAnimation, draw_x, draw_y, Math.floor(this.animationFrame), this.facing);
        // Отрисовка хитбоксов
        this.drawHitbox(ctx);
        this.drawAttackBox(ctx);
    },

    takeDamage: function (amount, attacker, attackType) {
        if (!this.isAlive) return;

        attackType = attackType || "Attack";

        this.health -= amount;
        console.log(this.characterName + " получил урон " + amount + ", здоровье: " + this.health);

        if (this.health <= 0) {
            this.kill();
        } else {
            this.isAttacking = false;
            this.currentAnimation = "Hurt";
            this.animationFrame = 0;
            this.speed_x = 0;

            // Звук получения урона
            if (this.characterName === "Soldier") {
                soundManager.play("sound/player_hurt.mp3", {volume: 0.7});
            } else {
                soundManager.play("sound/enemy_hurt.mp3", {volume: 0.7});
            }
        }
    },

    kill: function () {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.currentAnimation = "Dead";
        this.animationFrame = 0;
        this.speed_x = 0;

        // Звук смерти
        if (this.characterName !== "Soldier") {
            soundManager.play("sound/enemy_dead.mp3", {volume: 1});
        } else {
            soundManager.play("sound/player_dead.mp3", {volume: 1});
        }
    },

    update: function () {
        if (this.attackCooldown > 0) this.attackCooldown -= 1;

        if (!this.isAlive) {
            let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);
            if (sprite_data && sprite_data.data) {
                if (this.animationFrame < sprite_data.data.frame_count - 0.1) {
                    this.animationFrame += 0.1;
                }
            }
            return;
        }

        if (this.currentAnimation === "Hurt") {
            let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);
            if (sprite_data && sprite_data.data) {
                if (this.animationFrame < sprite_data.data.frame_count - 0.2) {
                    this.animationFrame += 0.2;
                } else {
                    this.animationFrame = 0;
                    this.currentAnimation = "Idle";
                }
            } else {
                // Если нет анимации Hurt, быстро возвращаемся в Idle
                setTimeout(() => {
                    this.currentAnimation = "Idle";
                    this.animationFrame = 0;
                }, 300);
            }
            return;
        }

        if (this.isAttacking) {
            this.updateAttackAnimation();
        }
    }
});

let Player = Character.extend({
    characterName: "Soldier",
    run_speed: CONSTS.PLAYER_SPEED.RUN,
    jump_velocity: CONSTS.PHYSICS.JUMP_VELOCITY,
    baseSpeed: CONSTS.PLAYER_SPEED.NORMAL,
    jump_input_locked: false,
    shot_input_locked: false,
    recharge_input_locked: false,
    attack_input_locked: false,
    attackHitChecked: false,
    walkToRun: false,
    regenCooldown: 0,
    regenTimer: 0,
    regenAmountPerSecond: CONSTS.STATS.HEALTH_REGEN,
    currentJumps: 0,
    health: CONSTS.STATS.PLAYER_HEALTH,

    // Для телепорта - НОВОЕ
    teleportCooldown: 0,
    teleportAvailable: true,

    // Для подбора бонусов - НОВОЕ
    mousePickupRadius: CONSTS.MOUSE.PICKUP_RADIUS,
    mousePickupActive: false,

    // Параметры атаки
    attackDamage: CONSTS.STATS.PLAYER_DAMAGE,
    attackRange: CONSTS.ATTACK.RANGE,
    attackCooldownTime: CONSTS.ATTACK.COOLDOWN,
    attackKnockback: CONSTS.ATTACK.KNOCKBACK,
    attackCooldownTimer: 0,

    // Параметры стрельбы
    maxBullets: 30,
    bullets: 30,
    shotDamage: CONSTS.BULLET.DAMAGE,
    shotCooldownTime: 10,
    shotCooldownTimer: 0,
    shotSpeed: CONSTS.BULLET.SPEED,
    canShoot: true,
    autoShotTimer: 0,

    // Параметры перезарядки
    rechargeTime: 60,
    rechargeTimer: 0,
    isReloading: false,

    // Счетчик кадров
    frameCount: 0,

    updateAnimation: function () {
        this.facing = eventsManager.facing;

        if (!this.isAlive) {
            this.currentAnimation = "Dead";
            return;
        }

        if (this.currentAnimation === "Hurt") {
            let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);
            if (sprite_data && sprite_data.data) {
                if (this.animationFrame < sprite_data.data.frame_count - 0.3) {
                    this.animationFrame += 0.3;
                } else {
                    this.currentAnimation = "Idle";
                    this.animationFrame = 0;
                }
            }
            return;
        }

        if (this.isReloading) {
            this.updateRechargeAnimation();
            return;
        }

        if (this.isAttacking) {
            this.updateAttackAnimation();
            return;
        }

        let new_animation = "Idle";
        let animation_speed = 0.2;
        let is_running = eventsManager.action["run"] && eventsManager.lastDirection !== 0;

        if (!physicsManager.isOnGround(this)) {
            new_animation = "Jump";
            animation_speed = 0.7;
        } else if (eventsManager.lastDirection !== 0) {
            if (is_running) {
                new_animation = "Run";
                animation_speed = 0.4;
            } else {
                new_animation = "Walk";
            }
        }

        if (new_animation !== this.currentAnimation) {
            this.currentAnimation = new_animation;
            this.animationFrame = 0;
        } else {
            let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);
            if (sprite_data && sprite_data.data) {
                let next_frame = this.animationFrame + animation_speed;
                this.animationFrame = next_frame % sprite_data.data.frame_count;
            }
        }
    },

    startAttack: function () {
        if (this.isAttacking || this.attackCooldownTimer > 0 || !this.isAlive ||
            this.isReloading) {
            return false;
        }

        this.isAttacking = true;
        this.currentAnimation = "Attack";
        this.animationFrame = 0;
        this.attackHitChecked = false;

        soundManager.play("sound/shot.mp3", {volume: 0.7});
        this.speed_x = 0;

        console.log("Игрок атакует! Урон: " + this.attackDamage);
        return true;
    },

    updateAttackAnimation: function () {
        if (!this.isAttacking) return;

        let animation_speed = 0.4;
        let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);

        if (!sprite_data || !sprite_data.data) {
            this.isAttacking = false;
            this.currentAnimation = "Idle";
            this.attackCooldownTimer = this.attackCooldownTime;
            return;
        }

        let next_frame = this.animationFrame + animation_speed;

        if (Math.floor(this.animationFrame) < 2 && Math.floor(next_frame) >= 2) {
            if (!this.attackHitChecked) {
                this.checkAttackHit();
                this.attackHitChecked = true;
            }
        }

        if (next_frame >= sprite_data.data.frame_count) {
            this.isAttacking = false;
            this.animationFrame = 0;
            this.currentAnimation = "Idle";
            this.attackCooldownTimer = this.attackCooldownTime;
            this.attackHitChecked = false;
            console.log("Атака завершена, кулдаун: " + this.attackCooldownTime + " кадров");
        } else {
            this.animationFrame = next_frame;
        }
    },

    startShot: function () {
        console.log("Попытка выстрела", {
            alive: this.isAlive,
            canShoot: this.canShoot,
            reloading: this.isReloading,
            attacking: this.isAttacking,
            cooldown: this.shotCooldownTimer,
            bullets: this.bullets
        });

        if (!this.isAlive || !this.canShoot || this.isReloading ||
            this.isAttacking || this.shotCooldownTimer > 0) {
            console.log("Выстрел заблокирован");
            return false;
        }

        if (CONSTS.AUTOSHOT.RELOAD_WHEN_EMPTY && this.bullets <= 0) {
            console.log("Нет патронов, начинаем перезарядку");
            this.startRecharge();
            return false;
        }

        this.bullets--;
        this.shotCooldownTimer = this.shotCooldownTime;

        this.createBullet();

        this.playShotAnimation();

        soundManager.play("sound/shot.mp3", {volume: 0.8});

        if (window.updateGameUI) {
            updateGameUI();
        }

        console.log("Выстрел произведен! Осталось патронов:", this.bullets);
        return true;
    },

    playShotAnimation: function () {
        let prevAnimation = this.currentAnimation;
        let prevFrame = this.animationFrame;

        this.currentAnimation = "Shot";
        this.animationFrame = 0;

        setTimeout(() => {
            if (this.currentAnimation === "Shot") {
                this.currentAnimation = prevAnimation;
                this.animationFrame = prevFrame;
            }
        }, 100);
    },

    createBullet: function () {
        console.log("Создание пули...");

        if (!gameManager || !gameManager.entities) {
            console.error("GameManager не инициализирован");
            return;
        }

        let bullet = Object.create(Bullet);

        bullet.size_x = 16;
        bullet.size_y = 8;
        bullet.damage = this.shotDamage;
        bullet.speed_x = this.facing * this.shotSpeed;
        bullet.speed_y = 0;
        bullet.facing = this.facing;
        bullet.isAlive = true;
        bullet.lifetime = CONSTS.BULLET.LIFETIME;
        bullet.owner = this;

        let offsetX = this.facing === 1 ? this.size_x : -bullet.size_x;
        bullet.pos_x = this.pos_x + (this.size_x / 2) + offsetX;

        bullet.pos_y = this.pos_y + (this.size_y / 3) - (bullet.size_y / 2);

        console.log("Пуля создана:", {
            x: bullet.pos_x,
            y: bullet.pos_y,
            playerY: this.pos_y,
            playerHeight: this.size_y,
            speed: bullet.speed_x,
            facing: this.facing
        });

        gameManager.entities.push(bullet);
        console.log("Всего сущностей:", gameManager.entities.length);
    },

    startRecharge: function () {
        if (!this.isAlive || this.isReloading || this.isAttacking) {
            return false;
        }

        if (this.bullets >= this.maxBullets) {
            console.log("Магазин уже полный");
            return false;
        }

        this.isReloading = true;
        this.canShoot = false;
        this.currentAnimation = "Recharge";
        this.animationFrame = 0;
        this.rechargeTimer = this.rechargeTime;

        this.speed_x = 0;

        console.log("Начинается перезарядка...");
        return true;
    },

    updateRechargeAnimation: function () {
        if (!this.isReloading) return;

        let animation_speed = 0.2;
        let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);

        if (!sprite_data || !sprite_data.data) {
            this.finishRecharge();
            return;
        }

        let next_frame = this.animationFrame + animation_speed;

        this.rechargeTimer--;

        if (this.rechargeTimer <= 0) {
            this.finishRecharge();
        } else if (next_frame >= sprite_data.data.frame_count) {
            this.animationFrame = 0;
        } else {
            this.animationFrame = next_frame;
        }
    },

    finishRecharge: function () {
        this.bullets = this.maxBullets;
        this.canShoot = true;

        this.isReloading = false;
        this.animationFrame = 0;
        this.currentAnimation = "Idle";

        if (window.updateGameUI) {
            updateGameUI();
        }

        console.log("Перезарядка завершена! Патронов:", this.bullets);
        soundManager.play("sound/coin.mp3", {volume: 0.3});
    },

    getAttackBox: function () {
        if (!this.isAttacking) return null;

        let attack_width = this.attackRange;
        let attack_height = this.size_y * 0.7;

        let attack_x, attack_y;

        if (this.facing === 1) {
            attack_x = this.pos_x + this.size_x - 5;
        } else {
            attack_x = this.pos_x - attack_width + 5;
        }

        attack_y = this.pos_y + (this.size_y - attack_height) / 2;

        return {
            x: attack_x,
            y: attack_y,
            w: attack_width,
            h: attack_height
        };
    },

    checkAttackHit: function () {
        if (!this.isAttacking) return;

        let attackBox = this.getAttackBox();
        if (!attackBox) return;

        for (let i = 0; i < gameManager.entities.length; i++) {
            let entity = gameManager.entities[i];

            if (entity === this || !entity.isAlive || !entity.getHitbox) continue;

            let enemyHitbox = entity.getHitbox();

            if (this.checkAABBCollision(attackBox, enemyHitbox)) {
                entity.takeDamage(this.attackDamage, this, "melee");
                this.knockbackEnemy(entity);
                console.log("Игрок попал по " + entity.characterName + " уроном: " + this.attackDamage);
            }
        }
    },

    checkAABBCollision: function (boxA, boxB) {
        return (
            boxA.x < boxB.x + boxB.w &&
            boxA.x + boxA.w > boxB.x &&
            boxA.y < boxB.y + boxB.h &&
            boxA.y + boxA.h > boxB.y
        );
    },

    knockbackEnemy: function (enemy) {
        if (!enemy || !enemy.isAlive) return;

        if (this.facing === 1) {
            enemy.speed_x = this.attackKnockback;
        } else {
            enemy.speed_x = -this.attackKnockback;
        }

        enemy.speed_y = -3;

        if (enemy.currentAnimation !== "Hurt") {
            enemy.currentAnimation = "Hurt";
            enemy.animationFrame = 0;
        }

        soundManager.play("sound/enemy_hurt.mp3", {volume: 0.6});
    },

    move: function () {
        if (!this.isAlive || this.currentAnimation === "Hurt" || this.isReloading) {
            this.speed_x = 0;
            return;
        }

        // Обновляем кулдаун телепорта
        if (this.teleportCooldown > 0) {
            this.teleportCooldown--;
        } else {
            this.teleportAvailable = true;
        }

        if (this.attackCooldownTimer > 0) {
            this.attackCooldownTimer--;
        }

        if (this.shotCooldownTimer > 0) {
            this.shotCooldownTimer--;
        }

        let current_direction = eventsManager.lastDirection;
        let current_speed = eventsManager.action["run"] ? this.run_speed : this.baseSpeed;

        this.speed_x = 0;

        if (current_direction === 1) {
            this.speed_x = current_speed;
        } else if (current_direction === -1) {
            this.speed_x = -current_speed;
        }

        // Прыжок
        if (eventsManager.action["up"]) {
            if (physicsManager.isOnGround(this)) {
                this.speed_y = -this.jump_velocity;
                console.log("Прыжок!");
            } else if (CONSTS.DOUBLE_JUMP.ENABLE &&
                this.currentJumps < CONSTS.DOUBLE_JUMP.MAX_JUMPS &&
                !this.jump_input_locked) {
                this.speed_y = -CONSTS.DOUBLE_JUMP.SECOND_JUMP_FORCE;
                this.currentJumps++;
                this.jump_input_locked = true;
                console.log("Прыжок!");
            }
        } else {
            this.jump_input_locked = false;
        }

        // Сброс счетчика прыжков при приземлении
        if (physicsManager.isOnGround(this)) {
            this.currentJumps = 0;
        }

        // Авто-стрельба
        if (CONSTS.AUTOSHOT.SHOOT_ENABLED) {
            const isShooting = eventsManager.action["shot"] || eventsManager.action["shot_mouse"];

            if (isShooting) {
                this.autoShotTimer++;

                if (this.bullets > 0 && this.autoShotTimer >= CONSTS.AUTOSHOT.SHOOT_INTERVAL) {
                    if (this.startShot()) {
                        this.autoShotTimer = 0;
                    }
                }
            } else {
                this.autoShotTimer = 0;
                this.shot_input_locked = false;
            }
        } else {
            if (this.bullets > 0 && (eventsManager.action["shot"] || eventsManager.action["shot_mouse"]) && !this.shot_input_locked) {
                if (this.startShot()) {
                    this.shot_input_locked = true;
                }
            } else if (!eventsManager.action["shot"] && !eventsManager.action["shot_mouse"]) {
                this.shot_input_locked = false;
            }
        }

        // Автоперезарядка
        if (CONSTS.AUTOSHOT.RELOAD_WHEN_EMPTY &&
            this.bullets <= 0 &&
            !this.isReloading &&
            !this.isAttacking) {
            this.startRecharge();
        }

        // Атака
        if (eventsManager.action["attack"] && !this.attack_input_locked) {
            if (this.startAttack()) {
                this.attack_input_locked = true;
            }
        } else if (!eventsManager.action["attack"]) {
            this.attack_input_locked = false;
        }

        // Стрельба
        if (this.bullets > 0 && (eventsManager.action["shot"] || eventsManager.action["shot_mouse"]) && !this.shot_input_locked) {
            if (this.startShot()) {
                this.shot_input_locked = true;
            }
        } else if (!eventsManager.action["shot"] && !eventsManager.action["shot_mouse"]) {
            this.shot_input_locked = false;
        }

        // Перезарядка
        if (eventsManager.action["reload"] && !this.recharge_input_locked) {
            if (this.startRecharge()) {
                this.recharge_input_locked = true;
            }
        } else if (!eventsManager.action["reload"]) {
            this.recharge_input_locked = false;
        }

        // ТЕЛЕПОРТ МЫШКОЙ - НОВАЯ ЧАСТЬ
        if (CONSTS.MOUSE.TELEPORT_ENABLED &&
            this.teleportAvailable &&
            eventsManager.click.pressed &&
            eventsManager.action["run"]) { // Shift + клик

            if (this.teleportToMouse()) {
                // Телепорт успешен, уже обработан в методе
                console.log("Телепорт выполнен");
            }
        }

        // ПОДБОР БОНУСОВ МЫШКОЙ - НОВАЯ ЧАСТЬ
        if (CONSTS.MOUSE.PICKUP_ENABLED &&
            ((CONSTS.MOUSE.PICKUP_AUTO && eventsManager.action["run"]) || // Авто при Shift
                (CONSTS.MOUSE.PICKUP_CLICK && eventsManager.click.pressed))) { // По клику

            this.pickupCoinsWithMouse();
        }
    },

    update: function () {
        Character.update.call(this);

        if (!this.isAlive) return;

        // Регенерация здоровья
        if (CONSTS.STATS.ENABLE_REGEN &&
            this.regenCooldown <= 0 &&
            this.health < CONSTS.STATS.PLAYER_MAX_HEALTH) {

            this.regenTimer++;

            if (this.regenTimer >= CONSTS.GAME_LOOP.FPS) {
                this.health += this.regenAmountPerSecond;

                if (this.health > CONSTS.STATS.PLAYER_MAX_HEALTH) {
                    this.health = CONSTS.STATS.PLAYER_MAX_HEALTH;
                }

                this.regenTimer = 0;
            }
        }

        if (this.regenCooldown > 0) {
            this.regenCooldown--;
        }

        if (CONSTS.AUTOSHOT.RELOAD_WHEN_EMPTY && this.bullets <= 0 && !this.isReloading && !this.isAttacking) {
            this.startRecharge();
        }

        this.move();
        physicsManager.update(this);
        this.checkTakeCoin();
        this.updateAnimation();

        if (this.frameCount % 60 === 0) {
            console.log(`Player: x=${Math.round(this.pos_x)}, y=${Math.round(this.pos_y)}, 
                   speed_x=${this.speed_x.toFixed(2)}, speed_y=${this.speed_y.toFixed(2)},
                   onGround=${physicsManager.isOnGround(this)}, 
                   teleportCD=${this.teleportCooldown},
                   bullets=${this.bullets}/${this.maxBullets}`);
        }
        if (!this.frameCount) this.frameCount = 0;
        this.frameCount++;
    },

    checkTakeCoin: function () {
        if (!this.isAlive || !mapManager.tLayer || !mapManager.tLayer.data) return;

        let coin_tile_ids = [12];
        if (coin_tile_ids.length === 0) return;

        let collect_radius_px = 32;
        let tile_width = mapManager.tSize.x;
        let tile_height = mapManager.tSize.y;
        let layer_data = mapManager.tLayer.data;
        let coins_collected = 0;

        let player_left = this.pos_x;
        let player_right = this.pos_x + this.size_x;
        let player_top = this.pos_y;
        let player_bottom = this.pos_y + this.size_y;
        let player_center_x = this.pos_x + this.size_x / 2;

        let search_left = Math.max(0, Math.floor((player_left - collect_radius_px) / tile_width));
        let search_right = Math.min(mapManager.xCount - 1, Math.floor((player_right + collect_radius_px) / tile_width));
        let search_top = Math.max(0, Math.floor((player_top - collect_radius_px) / tile_height));
        let search_bottom = Math.min(mapManager.yCount - 1, Math.floor((player_bottom + collect_radius_px) / tile_height));

        for (let tile_y = search_top; tile_y <= search_bottom; tile_y++) {
            for (let tile_x = search_left; tile_x <= search_right; tile_x++) {
                let tile_index = tile_y * mapManager.xCount + tile_x;
                let tile_id = layer_data[tile_index];

                if (tile_id === 0 || !coin_tile_ids.includes(tile_id)) continue;

                let tile_left = tile_x * tile_width;
                let tile_right = tile_left + tile_width;
                let tile_top = tile_y * tile_height;
                let tile_bottom = tile_top + tile_height;
                let tile_center_x = tile_left + tile_width / 2;
                let tile_center_y = tile_top + tile_height / 2;

                let min_distance_x = Math.min(
                    Math.abs(player_left - tile_center_x),
                    Math.abs(player_right - tile_center_x),
                    Math.abs(player_center_x - tile_center_x)
                );

                let min_distance_y = Math.min(
                    Math.abs(player_top - tile_center_y),
                    Math.abs(player_bottom - tile_center_y),
                    Math.abs(player_bottom - 30 - tile_center_y)
                );

                if (min_distance_x <= collect_radius_px && min_distance_y <= collect_radius_px) {
                    layer_data[tile_index] = 0;
                    coins_collected++;
                    soundManager.play("sound/coin.mp3", {volume: 0.5});
                    console.log("Монетка собрана!");
                }
            }
        }

        if (coins_collected > 0) {
            gameManager.score += coins_collected * 100;
            console.log("Собрано монет:", coins_collected, "Новый счет:", gameManager.score);

            if (window.updateGameUI) {
                updateGameUI();
            }
        }
    },

    drawAttackDebug: function (ctx) {
        if (!CONSTS.ATTACK.DEBUG) return;
        if (!this.isAttacking) return;

        let attackBox = this.getAttackBox();
        if (!attackBox) return;

        let screenX = attackBox.x - mapManager.view.x;
        let screenY = attackBox.y - mapManager.view.y;

        ctx.save();
        ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, attackBox.w, attackBox.h);

        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText("АТАКА", screenX + attackBox.w / 2 - 15, screenY - 5);

        ctx.restore();
    },

    draw: function (ctx) {
        Character.draw.call(this, ctx);
        this.drawAttackDebug(ctx);
    },

    // Телепорт к курсору
    teleportToMouse: function() {
        if (!this.isAlive || !CONSTS.MOUSE.TELEPORT_ENABLED) {
            return false;
        }

        // Проверяем кулдаун
        if (this.teleportCooldown > 0) {
            console.log("Телепорт на кулдауне: " + this.teleportCooldown + " кадров");
            return false;
        }

        // Проверяем, зажата ли клавиша-модификатор
        if (!eventsManager.action["run"]) { // Shift для телепорта
            console.log("Для телепорта удерживайте Shift");
            return false;
        }

        // Проверяем клик мыши
        if (!eventsManager.click.pressed) {
            return false;
        }

        // Получаем координаты мыши в игровом мире
        const mouseWorldX = eventsManager.click.x + mapManager.view.x;
        const mouseWorldY = eventsManager.click.y + mapManager.view.y;

        // Проверяем дистанцию
        const distance = Math.sqrt(
            Math.pow(mouseWorldX - (this.pos_x + this.size_x / 2), 2) +
            Math.pow(mouseWorldY - (this.pos_y + this.size_y / 2), 2)
        );

        if (distance > CONSTS.MOUSE.TELEPORT_RANGE) {
            console.log(`Слишком далеко: ${Math.round(distance)} > ${CONSTS.MOUSE.TELEPORT_RANGE}`);
            return false;
        }

        // Проверяем, свободно ли место
        const targetX = mouseWorldX - this.size_x / 2;
        const targetY = mouseWorldY - this.size_y / 2;

        if (this.checkTeleportPosition(targetX, targetY)) {
            // Телепортируем
            this.pos_x = targetX;
            this.pos_y = targetY;

            // Устанавливаем кулдаун
            this.teleportCooldown = CONSTS.MOUSE.TELEPORT_COOLDOWN;
            this.teleportAvailable = false;

            // Сбрасываем скорость
            this.speed_x = 0;
            this.speed_y = 0;

            // Звук телепорта
            soundManager.play("sound/shot.mp3", {volume: 0.3});

            console.log(`Телепортирован в (${Math.round(targetX)}, ${Math.round(targetY)})`);

            // Сбрасываем клик
            eventsManager.resetClick();

            return true;
        }

        return false;
    },

    // Проверка позиции для телепорта
    checkTeleportPosition: function(x, y) {
        // Проверяем 4 угла хитбокса
        const points = [
            {x: x, y: y},
            {x: x + this.size_x, y: y},
            {x: x, y: y + this.size_y},
            {x: x + this.size_x, y: y + this.size_y}
        ];

        for (let point of points) {
            const tileIndex = mapManager.getTilesetIdx(point.x, point.y);
            if (tileIndex !== 0 && mapManager.wallIndices.includes(tileIndex)) {
                console.log("Стена в точке телепорта");
                return false;
            }
        }

        // Проверяем, не выходим ли за границы карты
        if (x < 0 || x + this.size_x > mapManager.mapSize.x ||
            y < 0 || y + this.size_y > mapManager.mapSize.y) {
            console.log("Выход за границы карты");
            return false;
        }

        return true;
    },

    // Подбор бонусов мышкой
    pickupCoinsWithMouse: function() {
        if (!this.isAlive || !CONSTS.MOUSE.PICKUP_ENABLED || !mapManager.tLayer) {
            return;
        }

        const mouseX = eventsManager.mousePos.x + mapManager.view.x;
        const mouseY = eventsManager.mousePos.y + mapManager.view.y;

        // Идентификаторы монеток (настройте под свою карту)
        const coinTileIds = [12, 13, 14];

        const pickupRadius = CONSTS.MOUSE.PICKUP_RADIUS;
        const tileSize = mapManager.tSize.x;

        // Определяем область поиска
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

                // Проверяем расстояние
                const tileCenterX = x * tileSize + tileSize / 2;
                const tileCenterY = y * tileSize + tileSize / 2;

                const distance = Math.sqrt(
                    Math.pow(mouseX - tileCenterX, 2) +
                    Math.pow(mouseY - tileCenterY, 2)
                );

                if (distance <= pickupRadius) {
                    // Автоматический подбор или по клику
                    if ((CONSTS.MOUSE.PICKUP_AUTO && eventsManager.action["run"]) || // Авто при зажатом Shift
                        (CONSTS.MOUSE.PICKUP_CLICK && eventsManager.click.pressed)) { // По клику

                        mapManager.tLayer.data[tileIndex] = 0;
                        coinsCollected++;
                        soundManager.play("sound/coin.mp3", {volume: 0.5});

                        console.log(`Монета собрана мышкой в (${x}, ${y})`);

                        // Если это был клик - сбрасываем
                        if (eventsManager.click.pressed && CONSTS.MOUSE.PICKUP_CLICK) {
                            eventsManager.resetClick();
                        }
                    }
                }
            }
        }

        if (coinsCollected > 0) {
            // Начисляем очки
            if (gameManager) {
                gameManager.score += coinsCollected * 100;
                console.log(`Собрано монет мышкой: ${coinsCollected}, очков: ${coinsCollected * 100}`);

                if (window.updateGameUI) {
                    updateGameUI();
                }
            }
        }
    }
});

let Enemy = Character.extend({
    state: 'patrol',
    target: null,
    lostTimer: 0,
    damage: CONSTS.STATS.ENEMY_DAMAGE,
    health: CONSTS.STATS.ENEMY_HEALTH,

    patrol_speed: CONSTS.ENEMY_SPEED.NORMAL,
    run_speed: CONSTS.ENEMY_SPEED.RUN,

    visionRange: 300,
    attackRange: CONSTS.ATTACK.ENEMY_RANGE,

    // Параметры кулдауна атаки
    attackCooldownMax: 60,        // 60 FPS
    currentAttackCooldown: 0,     // Текущий кулдаун
    isOnCooldown: false,          // Флаг кулдауна

    // Атака
    attackWindupTime: 15,         // Подготовка к атаке
    attackWindupTimer: 0,         // Таймер подготовки
    isWindingUp: false,           // Флаг подготовки

    // Проверка на платформу
    checkPlatformEdge: function () {
        var checkX = (this.facing === 1) ?
            (this.pos_x + this.size_x + 10) :
            (this.pos_x - 10);
        var checkY = this.pos_y + this.size_y + 5;
        var tileIndex = mapManager.getTilesetIdx(checkX, checkY);
        return (tileIndex === 0 || !mapManager.wallIndices.includes(tileIndex));
    },

    // Проверка на стену
    checkWallCollision: function () {
        var checkX = (this.facing === 1) ?
            (this.pos_x + this.size_x + 2) :
            (this.pos_x - 2);
        var checkY = this.pos_y + (this.size_y / 2);
        var tileIndex = mapManager.getTilesetIdx(checkX, checkY);
        return (tileIndex !== 0 && mapManager.wallIndices.includes(tileIndex));
    },

    // Патрулирование
    patrol: function () {
        this.currentAnimation = 'Walk';
        this.speed_x = this.facing * this.patrol_speed;

        if (this.checkPlatformEdge() || this.checkWallCollision()) {
            this.facing *= -1;
            this.speed_x = 0;
            this.animationFrame = 0;
            return;
        }

        this.animationFrame += 0.2;
        let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);
        if (sprite_data && sprite_data.data) {
            if (this.animationFrame >= sprite_data.data.frame_count) {
                this.animationFrame = 0;
            }
        }
    },

    // Погоня с новой логикой кулдауна
    chase: function () {
        if (!this.target || !this.target.isAlive) {
            this.state = 'patrol';
            this.resetAttackState();
            return;
        }

        var distX = this.target.pos_x - this.pos_x;
        var dist = Math.abs(distX);

        // Поворачиваемся к цели
        this.facing = (distX > 0) ? 1 : -1;

        // Если цель вне радиуса атаки - двигаемся к ней
        if (dist > this.attackRange) {
            this.resetAttackState();
            this.currentAnimation = 'Run';
            this.speed_x = this.facing * this.run_speed;

            if (this.checkPlatformEdge() || this.checkWallCollision()) {
                this.speed_x = 0;
                this.currentAnimation = 'Idle';
                this.animationFrame = 0;
                return;
            }

            this.animationFrame += 0.3;
            let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);
            if (sprite_data && sprite_data.data) {
                if (this.animationFrame >= sprite_data.data.frame_count) {
                    this.animationFrame = 0;
                }
            }
        } else {
            // Цель в радиусе атаки
            this.speed_x = 0;

            // Если на кулдауне - просто ждем
            if (this.isOnCooldown) {
                this.currentAnimation = 'Idle';
                this.animationFrame = (this.animationFrame + 0.1) % 10;
                return;
            }

            // Если не готовимся к атаке и не атакуем - начинаем подготовку
            if (!this.isWindingUp && !this.isAttacking) {
                this.isWindingUp = true;
                this.attackWindupTimer = 0;
                this.currentAnimation = 'Idle';
                console.log(this.characterName + " начинает подготовку к атаке");
            }

            // Обработка подготовки к атаке
            if (this.isWindingUp) {
                this.attackWindupTimer++;

                // Визуальный индикатор подготовки (например, мигание)
                if (Math.floor(this.attackWindupTimer / 5) % 2 === 0) {
                    // Можно добавить визуальный эффект
                }

                // Завершение подготовки - запуск атаки
                if (this.attackWindupTimer >= this.attackWindupTime) {
                    this.startAttack();
                    this.isWindingUp = false;
                }
            }

            // Если уже атакуем - анимация обрабатывается в updateAttackAnimation
            if (this.isAttacking) {
                this.currentAnimation = 'Attack';
            }
        }
    },

    // Запуск атаки
    startAttack: function () {
        if (this.isOnCooldown || this.isAttacking) {
            return;
        }

        this.isAttacking = true;
        this.currentAnimation = "Attack";
        this.animationFrame = 0;
        console.log(this.characterName + " атакует!");
    },

    // Обновление анимации атаки
    updateAttackAnimation: function () {
        if (!this.isAttacking) return;

        let animation_speed = 0.3;
        let sprite_data = spriteManager.getSprite(this.characterName, this.currentAnimation);

        if (!sprite_data || !sprite_data.data) {
            this.finishAttack();
            return;
        }

        let next_frame = this.animationFrame + animation_speed;

        // Проверка попадания на середине анимации
        if (Math.floor(this.animationFrame) < 2 && Math.floor(next_frame) >= 2) {
            this.checkAttackHit();
        }

        if (next_frame >= sprite_data.data.frame_count) {
            // Анимация завершена
            this.finishAttack();
        } else {
            this.animationFrame = next_frame;
        }
    },

    // Завершение атаки (устанавливает кулдаун)
    finishAttack: function () {
        this.isAttacking = false;
        this.animationFrame = 0;
        this.currentAnimation = "Idle";

        // Устанавливаем кулдаун
        this.isOnCooldown = true;
        this.currentAttackCooldown = this.attackCooldownMax;
        console.log(this.characterName + " атака завершена, кулдаун: " + this.currentAttackCooldown + " кадров");
    },

    // Проверка попадания атаки
    checkAttackHit: function () {
        if (!this.target || !this.target.isAlive) return;

        let attackBox = this.getAttackBox();
        if (!attackBox) return;

        let targetHitbox = this.target.getHitbox();
        if (physicsManager.checkAABB(attackBox, targetHitbox)) {
            this.target.takeDamage(this.damage, this, "melee");

            if (this.target.characterName === "Soldier") {
                soundManager.play("sound/player_hurt.mp3", {volume: 0.7});
            }
        }
    },

    // Сброс состояния атаки
    resetAttackState: function () {
        this.isWindingUp = false;
        this.attackWindupTimer = 0;
        this.isAttacking = false;
    },

    // Поиск игрока
    scanForPlayer: function () {
        var player = gameManager.player;
        if (!player || !player.isAlive) {
            if (this.target) {
                this.target = null;
                this.state = 'patrol';
                this.resetAttackState();
            }
            return false;
        }

        var distX = player.pos_x - this.pos_x;
        var dist = Math.abs(distX);

        if (dist > this.visionRange) {
            return false;
        }

        var playerCenterY = player.pos_y + player.size_y / 2;
        var enemyCenterY = this.pos_y + this.size_y / 2;
        var distY = Math.abs(playerCenterY - enemyCenterY);

        if (distY > 100) {
            return false;
        }

        if (physicsManager.hasLineOfSight(this, player)) {
            this.target = player;
            this.state = 'chase';
            this.lostTimer = 180;
            return true;
        }

        return false;
    },

    // Основной ИИ
    aiUpdate: function () {
        // Обновляем кулдаун
        if (this.isOnCooldown) {
            this.currentAttackCooldown--;
            if (this.currentAttackCooldown <= 0) {
                this.isOnCooldown = false;
                console.log(this.characterName + " готов к атаке");
            }
        }

        if (this.isAttacking || this.currentAnimation === 'Hurt' || !this.isAlive) {
            return;
        }

        if (this.lostTimer > 0) this.lostTimer--;

        // Поиск игрока
        var seesPlayer = this.scanForPlayer();

        // Логика состояний
        if (this.target) {
            if (seesPlayer) {
                this.state = 'chase';
                this.chase();
            } else {
                if (this.lostTimer > 0) {
                    this.state = 'lost';
                    this.speed_x = 0;
                    this.currentAnimation = 'Idle';
                    this.resetAttackState();

                    this.animationFrame += 0.1;
                } else {
                    this.target = null;
                    this.state = 'patrol';
                    this.currentAnimation = 'Idle';
                    this.animationFrame = 0;
                    this.resetAttackState();
                }
            }
        } else {
            this.state = 'patrol';
            this.patrol();
        }
    },

    // Обновление
    update: function () {
        // Вызываем базовый update из Character
        Character.update.call(this);

        if (!this.isAlive) return;

        if (this.isAttacking) {
            this.updateAttackAnimation();
        } else {
            this.aiUpdate();
        }

        physicsManager.update(this);
    }
});

let Bullet = Entity.extend({
    speed_x: 0,
    speed_y: 0,
    damage: CONSTS.BULLET.DAMAGE,
    facing: 1,
    isAlive: true,
    lifetime: CONSTS.BULLET.LIFETIME,
    owner: null,
    size_x: CONSTS.BULLET.SIZE.x,
    size_y: CONSTS.BULLET.SIZE.y,

    update: function () {
        if (!this.isAlive) return;

        if(CONSTS.BULLET.AUTO_AIM){
            this.autoAIM();
        }

        this.lifetime--;
        if (this.lifetime <= 0) {
            console.log("Пуля истекла по времени");
            this.isAlive = false;
            return;
        }

        // Двигаем пулю
        let oldX = this.pos_x;
        let oldY = this.pos_y;

        this.pos_x += this.speed_x;
        this.pos_y += this.speed_y;

        console.log("Пуля движется:", oldX, "->", this.pos_x, "Y:", this.pos_y);

        // Проверяем столкновение со стенами - только с ВЕРТИКАЛЬНЫМИ стенами
        // Игнорируем пол, так как пуля летит на высоте
        if (this.checkWallCollision()) {
            console.log("Пуля столкнулась со стеной");
            this.isAlive = false;
            return;
        }

        // Проверяем столкновение с врагами
        this.checkEnemyCollision();

        // Проверяем выход за границы карты
        if (this.pos_x < 0 || this.pos_x > mapManager.mapSize.x ||
            this.pos_y < 0 || this.pos_y > mapManager.mapSize.y) {
            console.log("Пуля вышла за границы карты");
            this.isAlive = false;
        }
    },

    checkWallCollision: function () {
        // Проверяем только точки по бокам пули (не снизу)
        let points = [
            {x: this.pos_x, y: this.pos_y + this.size_y / 2}, // левая середина
            {x: this.pos_x + this.size_x, y: this.pos_y + this.size_y / 2}, // правая середина
            {x: this.pos_x + this.size_x / 2, y: this.pos_y}, // верхняя середина
            {x: this.pos_x + this.size_x / 2, y: this.pos_y + this.size_y} // нижняя середина
        ];

        for (let i = 0; i < points.length; i++) {
            var tileIndex = mapManager.getTilesetIdx(points[i].x, points[i].y);
            if (tileIndex !== 0 && mapManager.wallIndices.includes(tileIndex)) {
                console.log("Столкновение в точке:", points[i], "тайл:", tileIndex);
                return true;
            }
        }
        return false;
    },

    checkEnemyCollision: function () {
        for (let i = 0; i < gameManager.entities.length; i++) {
            let entity = gameManager.entities[i];

            // Пропускаем игрока, владельца пули и неживых
            if (entity === this.owner || entity === this ||
                !entity.isAlive || !entity.getHitbox ||
                entity.constructor === Bullet) continue;

            let enemyHitbox = entity.getHitbox();
            let bulletHitbox = this.getHitbox();

            if (physicsManager.checkAABB(bulletHitbox, enemyHitbox)) {
                console.log("Пуля попала в " + entity.characterName);
                entity.takeDamage(this.damage, this.owner, "bullet");
                this.isAlive = false;
                break;
            }
        }
    },

    getHitbox: function () {
        return {
            x: this.pos_x,
            y: this.pos_y,
            w: this.size_x,
            h: this.size_y
        };
    },

    draw: function (ctx) {
        if (!this.isAlive) return;

        let screenX = this.pos_x - mapManager.view.x;
        let screenY = this.pos_y - mapManager.view.y;

        ctx.save();

        // Ядро пули (желтый)
        ctx.fillStyle = "yellow";
        ctx.fillRect(screenX, screenY, CONSTS.BULLET.SIZE.x, CONSTS.BULLET.SIZE.y);

        // Контур (оранжевый)
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, CONSTS.BULLET.SIZE.x, CONSTS.BULLET.SIZE.y);

        // Светящийся эффект
        ctx.fillStyle = "rgba(255, 255, 200, 0.5)";
        ctx.fillRect(screenX + 2, screenY + 2, Math.max(0, CONSTS.BULLET.SIZE.x - 4), Math.max(0, CONSTS.BULLET.SIZE.y - 4));

        // Направление (белая точка спереди)
        ctx.fillStyle = "white";
        if (this.facing === 1) {
            ctx.fillRect(screenX + Math.max(0, CONSTS.BULLET.SIZE.x - 4), screenY + 2, 2, Math.max(0, CONSTS.BULLET.SIZE.y - 4));
        } else {
            ctx.fillRect(screenX + 2, screenY + 2, 2, Math.max(0, CONSTS.BULLET.SIZE.y - 4));
        }

        if (CONSTS.BULLET.DEBUG) {
            // Отладочная информация
            ctx.fillStyle = "white";
            ctx.font = "8px Arial";
            ctx.fillText("BULLET", screenX, screenY - 5);
        }
        ctx.restore();
    },

    autoAIM: function () {
        let new_x=0;
        let new_y=0;

        for(let i =0;i<gameManager.countEnemies();i++){
            let entity = gameManager.entities[i];
            if(entity.isAlive && entity.characterName!=="Soldier") {
                let dist_x = gameManager.player.pos_x - entity.pos_x;
                let dist_y = gameManager.player.pos_y - entity.pos_y;
                if(Math.abs(new_x)> Math.abs(dist_x) && Math.abs(new_y)> Math.abs(dist_y)) {
                    new_x=dist_x;
                    new_y=dist_y;
                }
            }
        }

        this.speed_x=new_x;
        this.speed_y=new_y;
    }
});
