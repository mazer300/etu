let mapManager = {
    mapData: null,
    tLayer: null,
    bgLayer: null,
    xCount: 30,
    yCount: 20,
    imgLoadCount: 0,
    imgLoaded: false,
    jsonLoaded: false,
    tSize: {x: 32, y: 32},
    mapSize: {x: 20000, y: 1000},
    tilesets: [],
    view: {x: 0, y: 0, w: 1365, h: 1000},
    wallIndices: CONSTS.COLLISION.WALL_INDICES,

    // Сброс карты
    reset: function () {
        this.mapData = null;
        this.tLayer = null;
        this.bgLayer = null;
        this.imgLoaded = false;
        this.imgLoadCount = 0;
        this.jsonLoaded = false;
        this.tilesets = [];
        this.view = {x: 0, y: 0, w: 1000, h: 500};
        console.log("MapManager сброшен");
    },

    // Загрузка карты
    loadMap: function (path) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                mapManager.parseMap(request.responseText);
                console.log("Карта успешно загружена");
            } else if (request.readyState === 4 && request.status !== 200) {
                console.log("Ошибка: не удалось загрузить карту", path, request.status);
            }
        };
        request.open("GET", path, true);
        request.send();
    },

    // Разбор карты
    parseMap: function (tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;

        let tilesets = this.mapData.tilesets.filter(t => t.image);
        let tileset_count = tilesets.length;

        if (tileset_count === 0) {
            console.log("В карте нет тайлсетов с изображениями");
            this.imgLoaded = true;
            this.jsonLoaded = true;
            return;
        }

        this.imgLoadCount = 0;

        for (let i = 0; i < tilesets.length; i++) {
            let img = new Image();
            img.onload = function () {
                mapManager.imgLoadCount++;
                console.log(`Загружен тайлсет ${mapManager.imgLoadCount}/${tileset_count}`);

                if (mapManager.imgLoadCount === tileset_count) {
                    mapManager.imgLoaded = true;
                    console.log("Все тайлсеты загружены");
                }
            };

            img.onerror = function () {
                console.log("Ошибка загрузки тайлсета");
                mapManager.imgLoadCount++;
                if (mapManager.imgLoadCount === tileset_count) {
                    mapManager.imgLoaded = true;
                }
            };

            let t = tilesets[i];
            let image_path = t.image;
            image_path = image_path.replace("../", "")
            console.log("Путь к изображению: " + image_path);

            img.src = image_path;
            let ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / mapManager.tSize.x),
                yCount: Math.floor(t.imageheight / mapManager.tSize.y)
            };
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
        console.log("JSON загружен")

        let tile_layers = this.mapData.layers.filter(layer => layer.type === "tilelayer");

        if (tile_layers.length > 1) {
            this.bgLayer = tile_layers[0];
            this.tLayer = tile_layers[1];
        } else if (tile_layers.length === 1) {
            this.tLayer = tile_layers[0];
            this.bgLayer = null;
        }

        this.parseEntities();
    },

    // Отрисовка слоя
    drawLayer: function (ctx, layer) {
        if (!layer) return;

        // Очищаем артефакты перед рисованием
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        for (let i = 0; i < layer.data.length; i++) {
            let layer_id = layer.data[i];

            if (layer_id <= 0) continue;

            // Получение корректного тайла
            let tile = this.getTile(layer_id);
            if (!tile || !tile.img) continue;

            // Расчёт корректных координат для тайла
            let tileX = (i % this.xCount) * this.tSize.x;
            let tileY = Math.floor(i / this.xCount) * this.tSize.y;

            if (!this.isVisible(tileX, tileY, this.tSize.x, this.tSize.y)) continue;

            // Преобразование в экранные координаты с округлением
            let screenX = Math.floor(tileX - this.view.x);
            let screenY = Math.floor(tileY - this.view.y);

            // Рисуем с округленными координатами и размерами
            ctx.drawImage(
                tile.img,
                tile.px, tile.py, this.tSize.x, this.tSize.y,
                screenX, screenY, this.tSize.x, this.tSize.y
            );
        }

        ctx.restore();
    },

    // Отрисовка карты
    draw: function (ctx) {
        if (!this.imgLoaded || !this.jsonLoaded) return;

        if (this.bgLayer) {
            this.drawLayer(ctx, this.bgLayer);
        }

        if (this.tLayer && this.tLayer !== this.bgLayer) {
            this.drawLayer(ctx, this.tLayer);
        }
    },

    // Получить тайл по индексу
    getTile: function (tileIndex) {
        var tile = {
            img: null,
            px: 0,
            py: 0
        };
        var tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        var id = tileIndex - tileset.firstgid;
        var x = id % tileset.xCount;
        var y = Math.floor(id / tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile;
    },

    // Получить тайлсет по индексу
    getTileset: function (tileIndex) {
        for (var i = this.tilesets.length - 1; i >= 0; i--) {
            if (this.tilesets[i].firstgid <= tileIndex) {
                return this.tilesets[i];
            }
        }
        return null;
    },

    // Получить данные тайлсета
    getTilesetIdx: function (x, y) {
        if (x < 0 || y < 0 || x >= this.mapSize.x || y >= this.mapSize.y || !this.tLayer || !this.tLayer.data) {
            return 0;
        }
        let idx = Math.floor(y / this.tSize.y) * this.xCount + Math.floor(x / this.tSize.x);
        return this.tLayer.data[idx];
    },

    // Проверка на видимость в кадре
    isVisible: function (x, y, width, height) {
        return !(x + width < this.view.x ||
            y + height < this.view.y ||
            x > this.view.x + this.view.w ||
            y > this.view.y + this.view.h);
    },

    // Центрирование камеры
    centerAt: function (x, y) {
        // камера по y
        let centered_y = y - this.view.h / 2;
        let new_y = Math.max(0, Math.min(centered_y, this.mapSize.y - this.view.h));
        this.view.y = Math.max(0, Math.min(new_y, this.mapSize.y - this.view.h));

        // Камера по x
        let centered_x = x - this.view.w / 2;
        this.view.x = Math.max(0, Math.min(centered_x, this.mapSize.x - this.view.w));
    },

    // Создание сущности на экране
    createEntity: function (type, name, index, layer_data) {
        let object = Object.create(gameManager.factory[type]);
        object.characterName = name;

        let sprite_size_x = 128
        let hitbox_width = 20;
        let hitbox_height = 96;

        let tile_x = (index % this.xCount) * this.tSize.x;
        let tile_y = Math.floor(index / this.xCount) * this.tSize.y;

        object.size_x = hitbox_width;
        object.size_y = hitbox_height;

        let ground_y = tile_y + (3 * this.tSize.y);

        object.pos_x = tile_x + (sprite_size_x - hitbox_width) / 2;
        object.pos_y = ground_y - hitbox_height;

        if (type === "Player") {
            gameManager.initPlayer(object);
        }
        gameManager.entities.push(object);

        let row1 = index; // Первый ряд
        let row2 = index + this.xCount; // Второй ряд
        let row3 = index + 2 * this.xCount; // Третий ряд

        // Проверяем границы карты перед стиранием
        if (row1 >= 0 && row1 < layer_data.length) layer_data[row1] = 0;
        if (row1 + 1 >= 0 && row1 + 1 < layer_data.length) layer_data[row1 + 1] = 0;

        if (row2 >= 0 && row2 < layer_data.length) layer_data[row2] = 0;
        if (row2 + 1 >= 0 && row2 + 1 < layer_data.length) layer_data[row2 + 1] = 0;

        if (row3 >= 0 && row3 < layer_data.length) layer_data[row3] = 0;
        if (row3 + 1 >= 0 && row3 + 1 < layer_data.length) layer_data[row3 + 1] = 0;

        console.log(`Создана сущность ${name} на позиции ${index}, очищено 6 тайлов`);

        return object;
    },

    // Разбор объектов
    parseEntities: function () {
        if (this.tLayer === null) return;

        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(function () {
                mapManager.parseEntities();
            }, 100);
            return;
        }

        let firstgid_Soldier = 368;
        let firstgid_Gangster_1 = 256;
        let firstgid_Gangster_2 = 144;
        let firstgid_Raider = 44;

        let layer_data = this.tLayer.data;
        let enemyCount = 0;

        for (let i = 0; i < layer_data.length; i++) {
            let id = layer_data[i];

            if (id === firstgid_Soldier) {
                let player_object = this.createEntity("Player", "Soldier", i, layer_data);
                this.centerAt(player_object.pos_x, player_object.pos_y);
            } else if (id === firstgid_Gangster_1) {
                this.createEntity("Enemy", "Gangster_1", i, layer_data);
                enemyCount++;
            } else if (id === firstgid_Gangster_2) {
                this.createEntity("Enemy", "Gangster_2", i, layer_data);
                enemyCount++;
            } else if (id === firstgid_Raider) {
                this.createEntity("Enemy", "Raider", i, layer_data);
                enemyCount++;
            }
        }

        // Сообщаем gameManager о количестве врагов
        if (gameManager) {
            gameManager.totalEnemies = enemyCount;
            console.log(`На карте создано врагов: ${enemyCount}`);
        }
    }
};