// Менеджер спрайтов для загрузки и отображения анимаций персонажей
let spriteManager = {
    // Конфигурация путей с анимациями для персонажей
    characterAtlases: {
        "Soldier": {
            "Idle": {path: "assets/Soldier/Idle.png", frame_count: 7},
            "Attack": {path: "assets/Soldier/Attack.png", frame_count: 3},
            "Dead": {path: "assets/Soldier/Dead.png", frame_count: 4},
            "Hurt": {path: "assets/Soldier/Hurt.png", frame_count: 3},
            "Recharge": {path: "assets/Soldier/Recharge.png", frame_count: 13},
            "Run": {path: "assets/Soldier/Run.png", frame_count: 8},
            "Shot": {path: "assets/Soldier/Shot_1.png", frame_count: 4},
            "Walk": {path: "assets/Soldier/Walk.png", frame_count: 7}
        },
        "Gangster_1": {
            "Idle": {path: "assets/Gangsters_1/Idle.png", frame_count: 7},
            "Attack": {path: "assets/Gangsters_1/Attack_1.png", frame_count: 6},
            "Attack_2": {path: "assets/Gangsters_1/Attack_2.png", frame_count: 4},
            "Dead": {path: "assets/Gangsters_1/Dead.png", frame_count: 5},
            "Hurt": {path: "assets/Gangsters_1/Hurt.png", frame_count: 4},
            "Run": {path: "assets/Gangsters_1/Run.png", frame_count: 10},
            "Walk": {path: "assets/Gangsters_1/Walk.png", frame_count: 10}
        },
        "Gangster_2": {
            "Idle": {path: "assets/Gangsters_2/Idle.png", frame_count: 7},
            "Attack": {path: "assets/Gangsters_2/Attack.png", frame_count: 5},
            "Dead": {path: "assets/Gangsters_2/Dead.png", frame_count: 5},
            "Hurt": {path: "assets/Gangsters_2/Hurt.png", frame_count: 4},
            "Run": {path: "assets/Gangsters_2/Run.png", frame_count: 7},
            "Walk": {path: "assets/Gangsters_2/Walk.png", frame_count: 10}
        },
        "Raider": {
            "Idle": {path: "assets/Raider/Idle.png", frame_count: 6},
            "Attack": {path: "assets/Raider/Attack_1.png", frame_count: 5},
            "Attack_2": {path: "assets/Raider/Attack_2.png", frame_count: 5},
            "Attack_3": {path: "assets/Raider/Attack_3.png", frame_count: 4},
            "Dead": {path: "assets/Raider/Dead.png", frame_count: 4},
            "Hurt": {path: "assets/Raider/Hurt.png", frame_count: 2},
            "Run": {path: "assets/Raider/Run.png", frame_count: 8},
            "Walk": {path: "assets/Raider/Walk.png", frame_count: 7}
        }
    },
    sprites: {}, // Хранилище загруженных спрайтов
    frameData: {}, // Данные о кардах анимации для каждого спрайта
    imgLoaded: false, // Флаг завершения загрузки всех изображений
    imgLoadedCount: 0, // Счётчик загруженных изображений
    totalImages: 0, // Общее количество изображений для загрузки

    reset: function () {
        this.sprites = {};
        this.frameData = {};
        this.imgLoaded = false;
        this.imgLoadedCount = 0;
        this.totalImages = 0;
        console.log("SpriteManager сброшен");
    },

    // Загрузка всех спрайтов персонажей
    loadAtlas: function () {
        let characters = Object.keys(this.characterAtlases);

        // Сброс состояний
        this.sprites = {};
        this.frameData = {};
        this.imgLoaded = false;
        this.imgLoadedCount = 0;

        console.log("Загрузка спрайтов...");

        characters.forEach(character_name => {
            let atlas = this.characterAtlases[character_name];
            let animation_names = Object.keys(atlas);
            this.totalImages += animation_names.length;

            animation_names.forEach(animation_name => {
                let def = atlas[animation_name]; // Описание анимации (путь, количество кадров)
                // Проверка на существование описания анимации
                if (!def) {
                    console.log(`Ошибка: Не найдено ${character_name} -> ${animation_name}`);
                    this.totalImages--;
                    return;
                }

                let image = new Image();

                // Успешная загрузка
                image.onload = () => {
                    spriteManager.imgLoadedCount++;
                    console.log(`Успешно загружено: ${character_name}_${animation_name} (${spriteManager.imgLoadedCount} из ${this.totalImages})`);

                    // Окончание загрузки
                    if (spriteManager.imgLoadedCount === spriteManager.totalImages) {
                        spriteManager.imgLoaded = true;
                        console.log("Все спрайты персонажей загружены");

                        // Уведомление о завершении загрузки для gameManager
                        if (typeof gameManager !== "undefined" && gameManager.onAssetsLoaded) {
                            gameManager.onAssetsLoaded();
                        }
                    }
                }

                // Неуспешная загрузка
                image.onerror = () => {
                    console.log(`Ошибка загрузки спрайта: ${def.path}`);
                    spriteManager.imgLoadedCount++;

                    // Все ли изображения загружены (даже с ошибками)
                    if (spriteManager.imgLoadedCount === spriteManager.totalImages) {
                        spriteManager.imgLoaded = true;
                        console.warn("Загрузка спрайтов персонажей завершилась с ошибками");

                        if (typeof gameManager !== "undefined" && gameManager.onAssetsLoaded) {
                            gameManager.onAssetsLoaded();
                        }
                    }
                }

                image.src = def.path;

                // Загрузка изображения в хранилище
                let sprite_key = character_name + "_" + animation_name;
                this.sprites[sprite_key] = image;

                this.frameData[sprite_key] = {
                    frame_count: def.frame_count, // Количество кадров
                    frame_size: {x: 128, y: 128}  // Стандартный размер для спрайтов
                };
            });
        });

        // Нет спрайтов
        if (this.totalImages === 0) {
            this.imgLoaded = true;
            console.log("Нет спрайтов для загрузки.");

            // Уведомление о завершении загрузки для gameManager
            if (typeof gameManager !== "undefined" && gameManager.onAssetsLoaded) {
                gameManager.onAssetsLoaded();
            }
        }
    },

    // Отрисовка спрайта
    drawSprite: function (ctx, name, animation, x, y, cur_frame, facing = 1) {
        // если изображение не загружено, то повторить запрос через 100 мс
        if (!this.imgLoaded) setTimeout(function () {
            spriteManager.drawSprite(ctx, name, animation, x, y, 1);
        }, 100);
        else {
            let sprite_data = this.getSprite(name, animation); // получить спрайт по имени
            if (!sprite_data.image || !sprite_data.data || !sprite_data.image.complete) return;

            let sprite = sprite_data.image;
            let data = sprite_data.data;

            // Вычисление текущего кадра в спрайтшите
            let frame_x = cur_frame % data.frame_count;
            let width = data.frame_size.x;
            let height = data.frame_size.y;

            // Преобразование мировых координат в экранные с учётом видимой области карты
            let draw_screen_x = Math.floor(x - mapManager.view.x);
            let draw_screen_y = Math.floor(y - mapManager.view.y);

            // Персонаж смотрит влево (facing = -1)
            if (facing === -1) {
                ctx.save();
                ctx.translate(draw_screen_x + width, draw_screen_y);
                ctx.scale(-1, 1);

                // Зеркальное изображение
                ctx.drawImage(sprite, frame_x * width, 0, width, height, 0, 0, width, height);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, frame_x * width, 0, width, height, draw_screen_x, draw_screen_y, width, height);
            }
        }
    },

    // Получить спрайт по имени
    getSprite: function (name, animation) {
        let key = name + "_" + animation;

        // Если спрайт не найдем, ищем альтернативы
        if (!this.sprites[key] || !this.frameData[key]) {
            if (animation === "Run") {
                key = name + "_Walk";
            } else {
                key = name + "_Idle";
            }
        }
        return {
            image: this.sprites[key], // Изображение спрайта
            data: this.frameData[key] // Метаданные анимации
        };
    }
};
