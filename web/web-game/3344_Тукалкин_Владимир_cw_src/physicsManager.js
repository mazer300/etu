let physicsManager = {
    gravity: CONSTS.PHYSICS.GRAVITY,

    // Новая функция для проверки столкновений с тайлами
    isWallTile: function (tileIndex) {
        if (tileIndex === 0) return false;
        return CONSTS.COLLISION.WALL_INDICES.includes(tileIndex);
    },

    // Обновление физики
    update: function (obj) {
        if (!obj.isAlive) {
            obj.speed_x = 0;
            obj.speed_y += this.gravity;
            obj.pos_y += obj.speed_y;
            return;
        }

        if (!(obj.isBlocking && this.isOnGround(obj))) {
            obj.speed_y += this.gravity;
        } else if (obj.isBlocking) {
            obj.speed_y = 0;
        }

        var newY = obj.pos_y + obj.speed_y;

        // Проверка коллизий с тайлами
        if (CONSTS.COLLISION.ENABLED && this.checkTileCollision(obj, obj.pos_x, newY)) {
            if (obj.speed_y > 0) { // Падение вниз
                var tileIndex = Math.floor((newY + obj.size_y - 1) / CONSTS.COLLISION.TILE_SIZE);
                var tileY = tileIndex * CONSTS.COLLISION.TILE_SIZE;
                newY = tileY - obj.size_y;
            } else if (obj.speed_y < 0) { // Прыжок вверх
                var tileIndex = Math.floor(newY / CONSTS.COLLISION.TILE_SIZE);
                var tileY = tileIndex * CONSTS.COLLISION.TILE_SIZE;
                newY = tileY + CONSTS.COLLISION.TILE_SIZE;
            }
            obj.speed_y = 0;
        }
        obj.pos_y = newY;

        var newX = obj.pos_x + obj.speed_x;

        // Проверка границ карты
        if (newX < 0) {
            newX = 0;
            obj.speed_x = 0;
        }
        var mapEdgeX = mapManager.mapSize.x - obj.size_x;
        if (newX > mapEdgeX) {
            newX = mapEdgeX;
            obj.speed_x = 0;
        }

        // Проверка коллизий с тайлами по X
        if (CONSTS.COLLISION.ENABLED && this.checkTileCollision(obj, newX, obj.pos_y) && !obj.isBlocking) {
            if (obj.speed_x > 0) { // Движение вправо
                var tileX = Math.floor((newX + obj.size_x) / mapManager.tSize.x) * mapManager.tSize.x;
                newX = tileX - obj.size_x;
            } else if (obj.speed_x < 0) { // Движение влево
                var tileX = Math.floor(newX / mapManager.tSize.x) * mapManager.tSize.x;
                newX = tileX + mapManager.tSize.x;
            }
            obj.speed_x = 0;
        }

        if (!obj.isBlocking) {
            obj.pos_x = newX;
        } else {
            obj.speed_x = 0;
        }

        // Ограничение максимальной скорости падения
        if (obj.speed_y > CONSTS.PHYSICS.TERMINAL_VELOCITY) {
            obj.speed_y = CONSTS.PHYSICS.TERMINAL_VELOCITY;
        }
    },

    // Проверка, стоит ли на земле объект
    isOnGround: function (obj) {
        var nextY = obj.pos_y + obj.size_y;
        var tileIndexBL = mapManager.getTilesetIdx(obj.pos_x, nextY);
        var tileIndexBR = mapManager.getTilesetIdx(obj.pos_x + obj.size_x - 1, nextY);
        var tileIndexBL_next = mapManager.getTilesetIdx(obj.pos_x, nextY + 1);
        var tileIndexBR_next = mapManager.getTilesetIdx(obj.pos_x + obj.size_x - 1, nextY + 1);

        var isSolidBL = this.isWallTile(tileIndexBL) || this.isWallTile(tileIndexBL_next);
        var isSolidBR = this.isWallTile(tileIndexBR) || this.isWallTile(tileIndexBR_next);

        return isSolidBL || isSolidBR;
    },

    // Проверка коллизии чтобы не проходили через стены
    checkTileCollision: function (obj, x, y) {
        if (!CONSTS.COLLISION.ENABLED) return false;

        // Ключевые точки для проверки коллизий
        var points = [
            {x: x, y: y}, // левый верх
            {x: x + obj.size_x - 1, y: y}, // правый верх
            {x: x, y: y + 32}, // середина слева
            {x: x + obj.size_x - 1, y: y + 32}, // середина справа
            {x: x, y: y + 64}, // низ слева
            {x: x + obj.size_x - 1, y: y + 64}, // низ справа
            {x: x, y: y + obj.size_y - 1}, // низ слева
            {x: x + obj.size_x - 1, y: y + obj.size_y - 1} // низ справа
        ];

        for (var i = 0; i < points.length; i++) {
            var tileIndex = mapManager.getTilesetIdx(points[i].x, points[i].y);
            if (this.isWallTile(tileIndex)) {
                return true;
            }
        }
        return false;
    },

    // Проверка попадания
    checkAABB: function (boxA, boxB) {
        if (!boxA || !boxB) return false;

        return (
            boxA.x < boxB.x + boxB.w &&
            boxA.x + boxA.w > boxB.x &&
            boxA.y < boxB.y + boxB.h &&
            boxA.y + boxA.h > boxB.y
        );
    },

    // Проверка коллизий между сущностями
    checkEntityCollision: function (objA, objB) {
        if (!CONSTS.COLLISION.ENTITY_COLLISION) return false;
        if (!objA || !objB || !objA.isAlive || !objB.isAlive) return false;
        if (objA === objB) return false;

        var hitboxA = objA.getHitbox ? objA.getHitbox() : null;
        var hitboxB = objB.getHitbox ? objB.getHitbox() : null;

        if (!hitboxA || !hitboxB) return false;

        return this.checkAABB(hitboxA, hitboxB);
    },

    // Разрешения коллизий между сущностями
    resolveEntityCollision: function (objA, objB) {
        if (!this.checkEntityCollision(objA, objB)) return;

        var hitboxA = objA.getHitbox();
        var hitboxB = objB.getHitbox();

        // Расчет пересечения
        var dx = (hitboxA.x + hitboxA.w / 2) - (hitboxB.x + hitboxB.w / 2);
        var dy = (hitboxA.y + hitboxA.h / 2) - (hitboxB.y + hitboxB.h / 2);

        // Определяем сторону столкновения
        var overlapX = (hitboxA.w / 2 + hitboxB.w / 2) - Math.abs(dx);
        var overlapY = (hitboxA.h / 2 + hitboxB.h / 2) - Math.abs(dy);

        if (overlapX < overlapY) {
            // Горизонтальное столкновение
            if (dx > 0) {
                // objA справа от objB
                objA.pos_x += overlapX;
                objB.pos_x -= overlapX;
            } else {
                // objA слева от objB
                objA.pos_x -= overlapX;
                objB.pos_x += overlapX;
            }
        } else {
            // Вертикальное столкновение
            if (dy > 0) {
                // objA ниже objB
                objA.pos_y += overlapY;
                objB.pos_y -= overlapY;
            } else {
                // objA выше objB
                objA.pos_y -= overlapY;
                objB.pos_y += overlapY;
            }
        }
    },

    // Проверка прямой видимости
    hasLineOfSight: function (objA, objB) {
        var startX = objA.pos_x + objA.size_x / 2;
        var startY = objA.pos_y + objA.size_y / 2;
        var endX = objB.pos_x + objB.size_x / 2;
        var endY = objB.pos_y + objB.size_y / 2;

        var dx = endX - startX;
        var dy = endY - startY;
        var distance = Math.sqrt(dx * dx + dy * dy);

        var steps = Math.ceil(distance / 16);
        if (steps <= 0) return true;

        var stepX = dx / steps;
        var stepY = dy / steps;

        for (var i = 1; i < steps; i++) {
            var checkX = startX + stepX * i;
            var checkY = startY + stepY * i;

            var tileIndex = mapManager.getTilesetIdx(checkX, checkY);
            if (this.isWallTile(tileIndex)) {
                return false;
            }
        }
        return true;
    }
};