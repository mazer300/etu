var soundManager = {
    clips: {},
    context: null,
    gainNode: null,
    loaded: false,
    playingSounds: [],
    initialized: false,

    // Инициализация
    init: function () {
        if (this.initialized) return;

        try {
            if (window.AudioContext) {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
                this.gainNode = this.context.createGain ?
                    this.context.createGain() :
                    this.context.createGainNode();
                this.gainNode.connect(this.context.destination);
                this.initialized = true;
                console.log("SoundManager инициализирован");
                return true;
            } else {
                console.error("Web Audio API не поддерживается в этом браузере");
                return false;
            }
        } catch (e) {
            console.error("Ошибка инициализации SoundManager:", e);
            return false;
        }
    },

    resumeContext: function () {
        if (this.context && this.context.state === 'suspended') {
            return this.context.resume().then(() => {
                console.log("AudioContext возобновлен");
                return true;
            }).catch(err => {
                console.error("Ошибка возобновления AudioContext:", err);
                return false;
            });
        }
        return Promise.resolve(true);
    },

    // Создаем клон soundManager с этим методом
    safePlay: function (path, settings) {
        if (!this.initialized) {
            this.init();
        }

        return this.resumeContext().then(() => {
            return this.play(path, settings);
        });
    },

    // Загрузка файла
    load: function (path, callback) {
        if (!this.initialized) {
            this.init();
        }

        if (this.clips[path]) {
            if (callback) callback(this.clips[path]);
            return;
        }

        var clip = {path: path, buffer: null, loaded: false};
        clip.play = function (volume, loop) {
            soundManager.safePlay(this.path, {
                looping: loop ? loop : false,
                volume: volume ? volume : 1
            });
        };
        this.clips[path] = clip;

        var request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            if (soundManager.context) {
                soundManager.context.decodeAudioData(request.response,
                    function (buffer) {
                        clip.buffer = buffer;
                        clip.loaded = true;
                        if (callback) callback(clip);
                    },
                    function (e) {
                        console.error("Ошибка декодирования аудио:", path, e);
                    }
                );
            } else {
                console.error("AudioContext не инициализирован");
            }
        };

        request.onerror = function () {
            console.error("Ошибка загрузки аудиофайла:", path);
        };
        request.send();
    },

    // Загрузка всех файлов
    loadArray: function (array) {
        if (!this.initialized) {
            this.init();
        }

        let load_count = 0;
        let total = array.length;

        array.forEach(function (path) {
            soundManager.load(path, function () {
                load_count++;
                console.log(`Звук ${path} загружен ${load_count}/${total}`);

                if (load_count === total) {
                    soundManager.loaded = true;
                    console.log("Все звуки загружены");
                }
            });
        });
    },

    // Воспроизвение звука
    play: function (path, settings) {
        if (!this.initialized) {
            if (!this.init()) {
                console.warn("SoundManager не может воспроизвести: не инициализирован");
                return false;
            }
        }

        if (!this.loaded || !this.context) {
            setTimeout(function () {
                soundManager.play(path, settings);
            }, 200);
            return true; // Вернем true, потому что попробуем позже
        }

        var looping = false;
        var volume = 1;
        if (settings) {
            if (settings.looping !== undefined) looping = settings.looping;
            if (settings.volume !== undefined) volume = settings.volume;
        }

        var sd = this.clips[path];
        if (!sd || !sd.loaded) {
            console.warn("Звук не загружен или не найден:", path);
            return false;
        }

        try {
            var sound = this.context.createBufferSource();
            sound.buffer = sd.buffer;

            var gainNode = this.context.createGain();
            gainNode.gain.value = volume;

            sound.connect(gainNode);
            gainNode.connect(this.gainNode || this.context.destination);

            sound.loop = looping;
            sound.start(0);

            this.playingSounds.push(sound);

            if (!looping) {
                sound.onended = function () {
                    let index = soundManager.playingSounds.indexOf(sound);
                    if (index > -1) {
                        soundManager.playingSounds.splice(index, 1);
                    }
                };
            }
            return true;
        } catch (e) {
            console.error("Ошибка воспроизведения звука:", e);
            return false;
        }
    },

    // Остановить все звуки
    stopAll: function () {
        if (!this.context) return;

        this.playingSounds.forEach((sound) => {
            try {
                sound.stop(0);
            } catch (e) {
            }
        });
        this.playingSounds = [];
        console.log("Все звуки остановлены");
    }
};