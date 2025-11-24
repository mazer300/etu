const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://social-network-admin:3443';

console.log('🔧 Конфигурация:');
console.log('📍 ADMIN_API_URL:', ADMIN_API_URL);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/social-network-client')));

// HTTP agent для запросов к админке
const httpAgent = new (require('http').Agent)({
    keepAlive: true
});

// HTTPS agent с отключенной проверкой SSL
const httpsAgent = new (require('https').Agent)({
    rejectUnauthorized: false,
    keepAlive: true
});

// Локальное хранилище
let userSessions = {};
let messages = [];

// Генерация sessionId
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Middleware для проверки авторизации
function requireAuth(req, res, next) {
    const sessionId = req.headers.authorization || req.query.sessionid;

    if (!sessionId || !userSessions[sessionId]) {
        return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    req.userId = userSessions[sessionId];
    next();
}

// Функция для запросов к админке
async function adminRequest(method, endpoint, data = null) {
    try {
        const url = `${ADMIN_API_URL}${endpoint}`;
        const isHttps = url.startsWith('https');
        const agent = isHttps ? httpsAgent : httpAgent;

        const config = {
            agent: agent,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        console.log(`🔄 ${method} ${url}`, data ? `Data: ${JSON.stringify(data)}` : '');

        let response;
        switch (method.toLowerCase()) {
            case 'get':
                response = await axios.get(url, config);
                break;
            case 'post':
                response = await axios.post(url, data, config);
                break;
            case 'put':
                response = await axios.put(url, data, config);
                break;
            case 'delete':
                response = await axios.delete(url, config);
                break;
        }

        console.log(`✅ ${method} ${endpoint} success`);
        return response.data;
    } catch (error) {
        console.error(`❌ ${method} ${endpoint} failed:`, error.message);

        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
            console.log('🔄 Админка недоступна');
            throw new Error('ADMIN_UNAVAILABLE');
        }

        throw error;
    }
}

// Функции для работы с общими файлами данных
async function loadUsers() {
    try {
        const usersPath = path.join('/app', 'data', 'users.json');
        const data = await fs.readFile(usersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Ошибка чтения users.json:', error.message);
        return [];
    }
}

async function loadPosts() {
    try {
        const postsPath = path.join('/app', 'data', 'posts.json');
        const data = await fs.readFile(postsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Ошибка чтения posts.json:', error.message);
        return [];
    }
}

async function loadFriendships() {
    try {
        const friendshipsPath = path.join('/app', 'data', 'friendships.json');
        const data = await fs.readFile(friendshipsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Ошибка чтения friendships.json:', error.message);
        return [];
    }
}

async function saveUsers(users) {
    try {
        const usersPath = path.join('/app', 'data', 'users.json');
        await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
        console.log('✅ users.json обновлен');
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения users.json:', error.message);
        return false;
    }
}

async function savePosts(posts) {
    try {
        const postsPath = path.join('/app', 'data', 'posts.json');
        await fs.writeFile(postsPath, JSON.stringify(posts, null, 2));
        console.log('✅ posts.json обновлен');
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения posts.json:', error.message);
        return false;
    }
}

async function saveFriendships(friendships) {
    try {
        const friendshipsPath = path.join('/app', 'data', 'friendships.json');
        await fs.writeFile(friendshipsPath, JSON.stringify(friendships, null, 2));
        console.log('✅ friendships.json обновлен');
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения friendships.json:', error.message);
        return false;
    }
}

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await adminRequest('GET', '/api/health');
        res.json({
            status: 'OK',
            message: 'Client server is running',
            adminStatus: 'AVAILABLE',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            status: 'OK',
            message: 'Client server is running (admin unavailable)',
            adminStatus: 'UNAVAILABLE',
            timestamp: new Date().toISOString()
        });
    }
});

// Регистрация - работает с общими файлами
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, birthDate } = req.body;

        console.log('📝 Регистрация:', { name, email });

        // Загружаем пользователей из общих файлов
        const users = await loadUsers();

        // Проверяем существующего пользователя
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Создаем нового пользователя
        const newUser = {
            id: Math.max(0, ...users.map(u => u.id)) + 1,
            name: name.trim(),
            email: email.trim(),
            password: password || 'default123',
            birthDate: birthDate,
            avatar: "/public/images/default-avatar.jpg",
            role: "user",
            status: "active",
            avatarBlocked: false,
            stats: {
                friends: 0,
                photos: 0,
                posts: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Добавляем пользователя в общий файл
        users.push(newUser);
        await saveUsers(users);

        console.log('✅ Пользователь создан в общих данных:', newUser.id);

        // Пытаемся также создать в админке через API (если доступна)
        try {
            await adminRequest('POST', '/api/users', newUser);
            console.log('✅ Пользователь также создан в админке через API');
        } catch (error) {
            console.log('ℹ️  Админка недоступна для API создания');
        }

        // Создаем сессию
        const sessionId = generateSessionId();
        userSessions[sessionId] = newUser.id;

        res.json({
            user: newUser,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        res.status(500).json({
            message: 'Ошибка регистрации: ' + error.message
        });
    }
});

// Логин - работает с общими файлами
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔐 Логин:', email);

        // Загружаем пользователей из общих файлов
        const users = await loadUsers();
        const user = users.find(u => u.email === email && u.status === 'active');

        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Простая проверка пароля
        if (password !== user.password) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Создаем сессию
        const sessionId = generateSessionId();
        userSessions[sessionId] = user.id;

        console.log('✅ Успешный вход:', user.name);

        res.json({
            user: user,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        res.status(500).json({ message: 'Ошибка входа' });
    }
});

// Выход
app.post('/api/auth/logout', requireAuth, (req, res) => {
    const sessionId = req.headers.authorization;
    delete userSessions[sessionId];
    console.log('✅ Пользователь вышел:', req.userId);
    res.json({ success: true, message: 'Успешный выход' });
});

// Получение текущего пользователя
app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        const users = await loadUsers();
        const user = users.find(u => u.id === req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        console.error('❌ Ошибка получения пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение пользователей
app.get('/api/users', requireAuth, async (req, res) => {
    try {
        const search = req.query.search || '';
        const users = await loadUsers();

        let filteredUsers = users.filter(user =>
            user.id !== req.userId && user.status === 'active'
        );

        if (search) {
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Исправляем URL аватарок
        filteredUsers = filteredUsers.map(user => ({
            ...user,
            avatar: user.avatar && !user.avatar.startsWith('http') && !user.avatar.startsWith('/public')
                ? `/public${user.avatar}`
                : user.avatar
        }));

        res.json(filteredUsers);
    } catch (error) {
        console.error('❌ Ошибка получения пользователей:', error);
        res.status(500).json({ message: 'Ошибка получения пользователей' });
    }
});

// Друзья пользователя
app.get('/api/users/:id/friends', requireAuth, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const friendships = await loadFriendships();
        const friendIds = friendships
            .filter(f => f.userId === userId)
            .map(f => f.friendId);

        const users = await loadUsers();
        const friends = users.filter(u =>
            friendIds.includes(u.id) && u.status === 'active'
        );

        // Исправляем URL аватарок
        const friendsWithFixedAvatars = friends.map(friend => ({
            ...friend,
            avatar: friend.avatar && !friend.avatar.startsWith('http') && !friend.avatar.startsWith('/public')
                ? `/public${friend.avatar}`
                : friend.avatar
        }));

        res.json(friendsWithFixedAvatars);
    } catch (error) {
        console.error('❌ Ошибка получения друзей:', error);
        res.status(500).json({ message: 'Ошибка получения друзей' });
    }
});

// Посты друзей
app.get('/api/users/:id/friends/posts', requireAuth, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const friendships = await loadFriendships();
        const posts = await loadPosts();
        const users = await loadUsers();

        const friendIds = friendships
            .filter(f => f.userId === userId)
            .map(f => f.friendId);

        const friendsPosts = posts.filter(post =>
            (friendIds.includes(post.userId) || post.userId === userId) &&
            !post.blocked
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const postsWithAuthors = friendsPosts.map(post => ({
            ...post,
            author: users.find(u => u.id === post.userId) || {
                id: post.userId,
                name: 'Неизвестный пользователь',
                avatar: "/public/images/default-avatar.jpg",
                avatarBlocked: false
            }
        }));

        // Исправляем URL аватарок авторов
        const postsWithFixedAvatars = postsWithAuthors.map(post => ({
            ...post,
            author: {
                ...post.author,
                avatar: post.author.avatar && !post.author.avatar.startsWith('http') && !post.author.avatar.startsWith('/public')
                    ? `/public${post.author.avatar}`
                    : post.author.avatar
            }
        }));

        res.json(postsWithFixedAvatars);
    } catch (error) {
        console.error('❌ Ошибка получения постов:', error);
        res.status(500).json({ message: 'Ошибка получения постов' });
    }
});

// Добавление в друзья - взаимное
app.post('/api/friends', requireAuth, async (req, res) => {
    try {
        const { friendId } = req.body;

        console.log('👥 Добавление в друзья:', { userId: req.userId, friendId });

        const friendships = await loadFriendships();

        // Проверяем существующую дружбу в обе стороны
        const existingFriendship = friendships.find(f =>
            f.userId === req.userId && f.friendId === friendId
        );

        if (existingFriendship) {
            return res.status(400).json({ message: 'Этот пользователь уже у вас в друзьях' });
        }

        // Создаем две записи о дружбе (взаимные)
        const newFriendship1 = {
            id: Math.max(0, ...friendships.map(f => f.id)) + 1,
            userId: req.userId,
            friendId: parseInt(friendId)
        };

        const newFriendship2 = {
            id: newFriendship1.id + 1,
            userId: parseInt(friendId),
            friendId: req.userId
        };

        // Сохраняем обе дружбы в общие файлы
        friendships.push(newFriendship1, newFriendship2);
        await saveFriendships(friendships);

        console.log('✅ Взаимная дружба создана:', {
            user1: req.userId,
            user2: friendId
        });

        // Пытаемся также сохранить в админку через API
        try {
            await adminRequest('POST', '/api/friendships', newFriendship1);
            await adminRequest('POST', '/api/friendships', newFriendship2);
        } catch (error) {
            console.log('ℹ️  Админка недоступна для API создания дружбы');
        }

        res.json({ success: true, message: 'Пользователь добавлен в друзья' });

    } catch (error) {
        console.error('❌ Ошибка добавления друга:', error);
        res.status(500).json({
            message: 'Ошибка добавления друга: ' + error.message
        });
    }
});

// Удаление из друзей - взаимное
app.delete('/api/friends/:friendId', requireAuth, async (req, res) => {
    try {
        const friendId = parseInt(req.params.friendId);

        console.log('👥 Удаление из друзей:', { userId: req.userId, friendId });

        const friendships = await loadFriendships();

        // Удаляем обе записи о дружбе
        const friendshipIndex1 = friendships.findIndex(f =>
            f.userId === req.userId && f.friendId === friendId
        );

        const friendshipIndex2 = friendships.findIndex(f =>
            f.userId === friendId && f.friendId === req.userId
        );

        let deletedFriendships = [];

        if (friendshipIndex1 !== -1) {
            deletedFriendships.push(friendships[friendshipIndex1]);
            friendships.splice(friendshipIndex1, 1);
        }

        if (friendshipIndex2 !== -1) {
            deletedFriendships.push(friendships[friendshipIndex2]);
            friendships.splice(friendshipIndex2, 1);
        }

        if (deletedFriendships.length > 0) {
            await saveFriendships(friendships);

            // Пытаемся также удалить из админки через API
            try {
                for (const friendship of deletedFriendships) {
                    await adminRequest('DELETE', `/api/friendships/${friendship.id}`);
                }
            } catch (error) {
                console.log('ℹ️  Админка недоступна для API удаления дружбы');
            }
        }

        res.json({ success: true, message: 'Пользователь удален из друзей' });

    } catch (error) {
        console.error('❌ Ошибка удаления друга:', error);
        res.status(500).json({ message: 'Ошибка удаления друга' });
    }
});

// Создание поста
app.post('/api/posts', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;

        console.log('📝 Создание поста пользователем:', req.userId);

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Текст поста не может быть пустым' });
        }

        const posts = await loadPosts();

        const newPost = {
            id: Math.max(0, ...posts.map(p => p.id)) + 1,
            userId: req.userId,
            content: content.trim(),
            image: null,
            likes: 0,
            comments: 0,
            blocked: false,
            createdAt: new Date().toISOString()
        };

        // Сохраняем в общие файлы
        posts.unshift(newPost);
        await savePosts(posts);

        // Пытаемся также сохранить в админку через API
        try {
            await adminRequest('POST', '/api/posts', newPost);
        } catch (error) {
            console.log('ℹ️  Админка недоступна для API создания поста');
        }

        // Получаем автора для WebSocket
        const users = await loadUsers();
        const postWithAuthor = {
            ...newPost,
            author: users.find(u => u.id === req.userId)
        };

        io.emit('new_post', postWithAuthor);

        res.json(newPost);

    } catch (error) {
        console.error('❌ Ошибка создания поста:', error);
        res.status(500).json({
            message: 'Ошибка создания поста: ' + error.message
        });
    }
});

// Лайк поста
app.post('/api/posts/:id/like', requireAuth, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        const posts = await loadPosts();
        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex !== -1) {
            const updatedPost = {
                ...posts[postIndex],
                likes: (posts[postIndex].likes || 0) + 1
            };

            posts[postIndex] = updatedPost;
            await savePosts(posts);

            // Пытаемся также обновить в админке через API
            try {
                await adminRequest('PUT', `/api/posts/${postId}`, updatedPost);
            } catch (error) {
                console.log('ℹ️  Админка недоступна для API обновления поста');
            }

            const users = await loadUsers();
            const postWithAuthor = {
                ...updatedPost,
                author: users.find(u => u.id === updatedPost.userId)
            };

            io.emit('post_updated', postWithAuthor);
        }

        res.json({ success: true });

    } catch (error) {
        console.error('❌ Ошибка лайка:', error);
        res.status(500).json({ message: 'Ошибка лайка' });
    }
});

// ЧАТ: Получение сообщений с пользователем
app.get('/api/chat/:userId', requireAuth, async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.userId);

        const chatMessages = messages.filter(msg =>
            (msg.senderId === req.userId && msg.receiverId === otherUserId) ||
            (msg.senderId === otherUserId && msg.receiverId === req.userId)
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.json(chatMessages);
    } catch (error) {
        console.error('❌ Ошибка получения сообщений:', error);
        res.status(500).json({ message: 'Ошибка получения сообщений' });
    }
});

// ЧАТ: Отправка сообщения
app.post('/api/chat/:userId', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const receiverId = parseInt(req.params.userId);

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Сообщение не может быть пустым' });
        }

        const message = {
            id: Date.now(),
            senderId: req.userId,
            receiverId: receiverId,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            read: false
        };

        messages.push(message);

        io.emit('new_message', message);

        res.json(message);
    } catch (error) {
        console.error('❌ Ошибка отправки сообщения:', error);
        res.status(500).json({ message: 'Ошибка отправки сообщения' });
    }
});

// ЧАТ: Отметка сообщений как прочитанных
app.post('/api/chat/:userId/read', requireAuth, async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.userId);

        // Отмечаем все сообщения от этого пользователя как прочитанные
        messages.forEach(msg => {
            if (msg.senderId === otherUserId && msg.receiverId === req.userId && !msg.read) {
                msg.read = true;
            }
        });

        res.json({ success: true, message: 'Сообщения отмечены как прочитанные' });
    } catch (error) {
        console.error('❌ Ошибка отметки сообщений:', error);
        res.status(500).json({ message: 'Ошибка отметки сообщений' });
    }
});

// ЧАТ: Получение списка чатов
app.get('/api/chats', requireAuth, async (req, res) => {
    try {
        const userChats = [];

        const chatPartners = new Set();
        messages.forEach(msg => {
            if (msg.senderId === req.userId) chatPartners.add(msg.receiverId);
            if (msg.receiverId === req.userId) chatPartners.add(msg.senderId);
        });

        const users = await loadUsers();

        for (const partnerId of chatPartners) {
            const partner = users.find(u => u.id === partnerId);
            if (partner) {
                const lastMessage = messages
                    .filter(msg =>
                        (msg.senderId === req.userId && msg.receiverId === partnerId) ||
                        (msg.senderId === partnerId && msg.receiverId === req.userId)
                    )
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                const unreadCount = messages.filter(msg =>
                    msg.senderId === partnerId &&
                    msg.receiverId === req.userId &&
                    !msg.read
                ).length;

                userChats.push({
                    id: partnerId,
                    partner: {
                        ...partner,
                        avatar: partner.avatar && !partner.avatar.startsWith('http') && !partner.avatar.startsWith('/public')
                            ? `/public${partner.avatar}`
                            : partner.avatar
                    },
                    lastMessage: lastMessage,
                    unreadCount: unreadCount
                });
            }
        }

        // Сортируем чаты по времени последнего сообщения
        userChats.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
            return timeB - timeA;
        });

        res.json(userChats);
    } catch (error) {
        console.error('❌ Ошибка получения чатов:', error);
        res.status(500).json({ message: 'Ошибка получения чатов' });
    }
});

// Прокси для статических файлов из админки
app.use('/public', async (req, res) => {
    try {
        // Пробуем сначала найти файл локально
        const localPath = path.join('/app', 'public', req.path);
        try {
            await fs.access(localPath);
            console.log('📁 Serving local file:', req.path);
            return res.sendFile(localPath);
        } catch (localError) {
            // Если локально нет, пробуем получить через админку
            console.log('📁 File not found locally, trying admin:', req.path);
        }

        const url = `${ADMIN_API_URL}${req.url}`;
        console.log('📁 Proxy static file to admin:', url);

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            timeout: 5000,
            httpsAgent: httpsAgent,
            httpAgent: httpAgent
        });

        // Устанавливаем правильные заголовки
        const ext = path.extname(req.url).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        if (contentTypes[ext]) {
            res.set('Content-Type', contentTypes[ext]);
        }

        response.data.pipe(res);
    } catch (error) {
        console.error('❌ Error serving static file:', error.message);

        // Возвращаем default avatar если файл не найден
        if (req.url.includes('avatar')) {
            const defaultAvatarPath = path.join('/app', 'public', 'images', 'default-avatar.jpg');
            try {
                await fs.access(defaultAvatarPath);
                console.log('📁 Serving default avatar');
                return res.sendFile(defaultAvatarPath);
            } catch (e) {
                // Если default avatar тоже нет, возвращаем 404
                res.status(404).send('File not found');
            }
        } else {
            res.status(404).send('File not found');
        }
    }
});

// WebSocket
io.on('connection', (socket) => {
    console.log('🔌 WebSocket connected:', socket.id);

    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined WebSocket room`);
    });

    socket.on('leave_user', (userId) => {
        socket.leave(`user_${userId}`);
        console.log(`👤 User ${userId} left WebSocket room`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 WebSocket disconnected:', socket.id);
    });
});

// Angular routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/social-network-client/index.html'));
});

server.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 SOCIAL NETWORK CLIENT');
    console.log('=================================');
    console.log(`📍 Client: http://localhost:4200`);
    console.log(`📍 API: http://localhost:3001`);
    console.log(`📍 Admin: ${ADMIN_API_URL}`);
    console.log('=================================');
    console.log('✅ Сервер запущен с общими данными');
    console.log('✅ Все операции работают с общими файлами');
    console.log('=================================');
});