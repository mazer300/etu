// Основной серверный файл приложения социальной сети
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import https from 'https';
import http from 'http';
import fsSync from 'fs';

// Получение текущей директории для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware для парсинга JSON и форм
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы для разных сборок
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/dist-gulp', express.static(path.join(__dirname, 'dist-gulp')));
app.use('/dist-webpack', express.static(path.join(__dirname, 'dist-webpack')));

// Настройка EJS шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Путь к данным приложения
const DATA_DIR = path.join(__dirname, 'data');

// Функция для чтения JSON файлов с данными
const readJSON = async (filename) => {
    try {
        const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error.message);
        return [];
    }
};

// Функция для записи данных в JSON файлы
const writeJSON = async (filename, data) => {
    try {
        await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error.message);
        return false;
    }
};

// Получение инициалов из имени пользователя
const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
};

// Функция для рендеринга аватарки пользователя
const renderAvatar = (user, className = 'user-avatar-vk') => {
    const avatarUrl = user.avatar;
    const isBlocked = user.avatarBlocked;

    if (isBlocked) {
        return `<div class="${className} blocked-avatar" title="Аватар заблокирован">
              <i class="fas fa-ban"></i>
            </div>`;
    } else if (!avatarUrl || avatarUrl === '/public/images/default-avatar.jpg') {
        const initials = getInitials(user.name);
        return `<div class="${className} default-avatar" title="${user.name}">
              ${initials}
            </div>`;
    } else {
        return `<img src="${avatarUrl}" 
                 alt="${user.name}" 
                 class="${className}"
                 onerror="this.onerror=null; this.classList.add('default-avatar'); this.innerHTML='${getInitials(user.name)}'">`;
    }
};

// Middleware для определения типа сборки
app.use((req, res, next) => {
    res.locals.buildType = req.query.build || 'gulp';
    next();
});

// Middleware для передачи утилит в шаблоны
app.use((req, res, next) => {
    res.locals.renderAvatar = renderAvatar;
    res.locals.getInitials = getInitials;
    next();
});

// Главная страница - список пользователей
app.get('/', async (req, res) => {
    try {
        const users = await readJSON('users.json');
        res.render('users', {
            users,
            title: 'Управление пользователями',
            buildType: res.locals.buildType
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Ошибка загрузки пользователей' });
    }
});

// Страница пользователей (альтернативный маршрут)
app.get('/users', async (req, res) => {
    try {
        const users = await readJSON('users.json');
        res.render('users', {
            users,
            title: 'Управление пользователями',
            buildType: res.locals.buildType
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Ошибка загрузки пользователей' });
    }
});

// Страница друзей пользователя
app.get('/friends/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const users = await readJSON('users.json');
        const friendships = await readJSON('friendships.json');

        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).render('error', { error: 'Пользователь не найден' });
        }

        const friendIds = friendships
            .filter(f => f.userId === userId)
            .map(f => f.friendId);

        const friends = users.filter(u => friendIds.includes(u.id));

        res.render('friends', {
            user,
            friends,
            title: `Друзья ${user.name}`,
            buildType: res.locals.buildType
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Ошибка загрузки друзей' });
    }
});

// Страница новостей друзей пользователя
app.get('/news/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const users = await readJSON('users.json');
        const friendships = await readJSON('friendships.json');
        const posts = await readJSON('posts.json');

        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).render('error', { error: 'Пользователь не найден' });
        }

        const friendIds = friendships
            .filter(f => f.userId === userId)
            .map(f => f.friendId);

        const friendsPosts = posts.filter(post =>
            friendIds.includes(post.userId) || post.userId === userId
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const postsWithAuthors = friendsPosts.map(post => ({
            ...post,
            author: users.find(u => u.id === post.userId)
        }));

        res.render('news', {
            user,
            posts: postsWithAuthors,
            title: `Лента новостей ${user.name}`,
            buildType: res.locals.buildType
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Ошибка загрузки новостей' });
    }
});

// Форма редактирования пользователя
app.get('/users/:id/edit', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const users = await readJSON('users.json');

        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).render('error', { error: 'Пользователь не найден' });
        }

        res.render('user-edit', {
            user,
            title: `Редактирование ${user.name}`,
            buildType: res.locals.buildType
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Ошибка загрузки пользователя' });
    }
});

// Обновление данных пользователя
app.post('/users/:id/update', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, email, role, status, birthDate } = req.body;

        const users = await readJSON('users.json');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).render('error', { error: 'Пользователь не найден' });
        }

        users[userIndex] = {
            ...users[userIndex],
            name,
            email,
            role,
            status,
            birthDate: birthDate || users[userIndex].birthDate,
            updatedAt: new Date().toISOString()
        };

        const success = await writeJSON('users.json', users);

        if (success) {
            res.redirect(`/?build=${res.locals.buildType}`);
        } else {
            res.status(500).render('error', { error: 'Ошибка сохранения пользователя' });
        }
    } catch (error) {
        res.status(500).render('error', { error: 'Ошибка обновления пользователя' });
    }
});

// API для удаления пользователя
app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const users = await readJSON('users.json');

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        users.splice(userIndex, 1);

        const success = await writeJSON('users.json', users);

        if (success) {
            res.json({ success: true, message: 'Пользователь удален' });
        } else {
            res.status(500).json({ success: false, message: 'Ошибка сохранения' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для добавления нового пользователя
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, birthDate, role, status } = req.body;

        if (!name || !email || !birthDate || !role || !status) {
            return res.status(400).json({ success: false, message: 'Все поля обязательны для заполнения' });
        }

        const users = await readJSON('users.json');
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
        }

        const newId = Math.max(...users.map(u => u.id), 0) + 1;

        const newUser = {
            id: newId,
            name: name.trim(),
            email: email.trim(),
            birthDate: birthDate,
            avatar: null,
            role: role,
            status: status,
            avatarBlocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        users.push(newUser);

        const success = await writeJSON('users.json', users);

        if (success) {
            res.json({ success: true, message: 'Пользователь успешно добавлен', user: newUser });
        } else {
            res.status(500).json({ success: false, message: 'Ошибка сохранения пользователя' });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для блокировки аватарки пользователя
app.post('/api/users/:id/block-avatar', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const users = await readJSON('users.json');

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        users[userIndex].avatarBlocked = true;
        users[userIndex].updatedAt = new Date().toISOString();

        const success = await writeJSON('users.json', users);

        if (success) {
            res.json({ success: true, message: 'Аватарка заблокирована' });
        } else {
            res.status(500).json({ success: false, message: 'Ошибка сохранения' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для разблокировки аватарки пользователя
app.post('/api/users/:id/unblock-avatar', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const users = await readJSON('users.json');

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        users[userIndex].avatarBlocked = false;
        users[userIndex].updatedAt = new Date().toISOString();

        const success = await writeJSON('users.json', users);

        if (success) {
            res.json({ success: true, message: 'Аватарка разблокирована' });
        } else {
            res.status(500).json({ success: false, message: 'Ошибка сохранения' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для блокировки поста
app.post('/api/posts/:id/block', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const posts = await readJSON('posts.json');

        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            return res.status(404).json({ success: false, message: 'Пост не найден' });
        }

        posts[postIndex].blocked = true;

        const success = await writeJSON('posts.json', posts);

        if (success) {
            res.json({ success: true, message: 'Пост заблокирован' });
        } else {
            res.status(500).json({ success: false, message: 'Ошибка сохранения' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для разблокировки поста
app.post('/api/posts/:id/unblock', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const posts = await readJSON('posts.json');

        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            return res.status(404).json({ success: false, message: 'Пост не найден' });
        }

        posts[postIndex].blocked = false;

        const success = await writeJSON('posts.json', posts);

        if (success) {
            res.json({ success: true, message: 'Пост разблокирован' });
        } else {
            res.status(500).json({ success: false, message: 'Ошибка сохранения' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для удаления поста
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const posts = await readJSON('posts.json');

        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            return res.status(404).json({ success: false, message: 'Пост не найден' });
        }

        posts.splice(postIndex, 1);

        const success = await writeJSON('posts.json', posts);

        if (success) {
            res.json({ success: true, message: 'Пост удален' });
        } else {
            res.status(500).json({ success: false, message: 'Ошибка сохранения' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для проверки доступных сборок
app.get('/api/builds', async (req, res) => {
    try {
        const gulpFiles = await fs.readdir(path.join(__dirname, 'dist-gulp'));
        const webpackFiles = await fs.readdir(path.join(__dirname, 'dist-webpack'));

        res.json({
            gulp: {
                status: 'built',
                files: gulpFiles,
                features: ['LESS compilation', 'CSS minification', 'Babel transformation', 'JS minification']
            },
            webpack: {
                status: 'built',
                files: webpackFiles,
                features: ['Module bundling', 'Tree shaking', 'Asset optimization', 'Production build']
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Builds not found' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Сервер работает!',
        timestamp: new Date().toISOString(),
        protocol: req.protocol
    });
});

// Обработка 404 ошибок
app.use((req, res) => {
    res.status(404).render('error', { error: 'Страница не найдена' });
});

// Обработка внутренних ошибок сервера
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).render('error', { error: 'Внутренняя ошибка сервера' });
});

// Настройка портов для HTTP и HTTPS
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// HTTP сервер для редиректа на HTTPS
const httpServer = http.createServer((req, res) => {
    const httpsUrl = `https://${req.headers.host?.replace(/:\d+$/, '')}:${HTTPS_PORT}${req.url}`;
    res.writeHead(301, { Location: httpsUrl });
    res.end();
});

// SSL сертификаты для HTTPS
const sslOptions = {
    key: fsSync.readFileSync(path.join(__dirname, 'ssl/localhost.key')),
    cert: fsSync.readFileSync(path.join(__dirname, 'ssl/localhost.crt'))
};

// HTTPS сервер для основного приложения
const httpsServer = https.createServer(sslOptions, app);

// Запуск HTTP сервера
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('HTTP сервер запущен (редирект на HTTPS)');
    console.log(`http://localhost:${HTTP_PORT} → https://localhost:${HTTPS_PORT}`);
});

// Запуск HTTPS сервера
httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('SOCIAL NETWORK ADMIN ЗАПУЩЕН С HTTPS!');
    console.log('='.repeat(50));
    console.log(`Основное приложение: https://localhost:${HTTPS_PORT}`);
    console.log(`API health: https://localhost:${HTTPS_PORT}/api/health`);
    console.log('='.repeat(50));
    console.log('ФУНКЦИОНАЛ:');
    console.log('   Управление пользователями');
    console.log('   Администрирование друзей');
    console.log('   Модерация новостей');
    console.log('   Управление аватарками');
    console.log('   Две системы сборки (Gulp + Webpack)');
    console.log('   Защищенное HTTPS соединение');
    console.log('='.repeat(50));
    console.log('Доступные маршруты:');
    console.log('   GET  /                 - Список пользователей');
    console.log('   GET  /users/:id/edit   - Редактирование пользователя');
    console.log('   GET  /friends/:userId  - Друзья пользователя');
    console.log('   GET  /news/:userId     - Лента новостей');
    console.log('   POST /users/:id/update - Обновление пользователя');
    console.log('   DELETE /api/users/:id  - Удаление пользователя (API)');
    console.log('   POST /api/users/:id/block-avatar   - Блокировка аватарки (API)');
    console.log('   POST /api/users/:id/unblock-avatar - Разблокировка аватарки (API)');
    console.log('='.repeat(50));
});