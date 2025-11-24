const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { io: ClientIO } = require('socket.io-client');

const dataPath = process.env.DATA_FILE_PATH || '/app/data/data.json';
const adminUrl = process.env.ADMIN_URL || 'http://backend-admin:3011';
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3012", "http://frontend-exchange:80", "http://localhost:3000", "http://localhost:3010"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Подключаемся к админскому WebSocket
const adminSocket = ClientIO(adminUrl, {
    transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// Хранилище для клиентов
const connectedClients = new Map();

// Получаем обновления цен от админки
adminSocket.on('priceUpdate', (data) => {
    console.log('📊 Received prices from admin:', data);
    // Рассылаем обновления всем подключенным клиентам биржи
    io.emit('priceUpdate', data);
    console.log(`📤 Forwarded price update to ${io.engine.clientsCount} clients`);
});

adminSocket.on('exchangeConfig', (config) => {
    console.log('⚙️ Received config from admin:', config);
    io.emit('exchangeConfig', config);
});

adminSocket.on('trade', (tradeData) => {
    console.log('💰 Received trade from admin:', tradeData);
    io.emit('trade', tradeData);
});

adminSocket.on('connect', () => {
    console.log('✅ Connected to admin WebSocket');
});

adminSocket.on('disconnect', () => {
    console.log('❌ Disconnected from admin WebSocket');
});

adminSocket.on('connect_error', (error) => {
    console.error('❌ Admin WebSocket connection error:', error);
});

// Базовый эндпоинт для проверки
app.get('/', (req, res) => {
    res.json({
        message: 'Stock Exchange Trading Backend API',
        version: '1.0.0',
        connectedToAdmin: adminSocket.connected,
        connectedClients: io.engine.clientsCount
    });
});

// Проксируем все API запросы к админке
app.use('/api', async (req, res) => {
    try {
        const url = `${adminUrl}${req.originalUrl}`;
        console.log(`🔁 Proxying ${req.method} ${req.originalUrl} to ${url}`);

        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...req.headers
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to proxy request' });
    }
});

// WebSocket соединения с клиентами
io.on('connection', (socket) => {
    console.log('✅ Client connected to exchange backend:', socket.id);
    connectedClients.set(socket.id, socket);

    // Отправляем текущее состояние при подключении
    socket.on('getInitialData', async () => {
        try {
            console.log('📦 Sending initial data to client:', socket.id);

            const [stocksResponse, configResponse] = await Promise.all([
                fetch(`${adminUrl}/api/stocks`),
                fetch(`${adminUrl}/api/exchange/config`)
            ]);

            const stocks = stocksResponse.ok ? await stocksResponse.json() : [];
            const config = configResponse.ok ? await configResponse.json() : {};

            socket.emit('initialData', {
                stocks: stocks,
                exchangeConfig: config
            });

            // Также отправляем текущие цены если есть
            if (adminSocket.connected) {
                socket.emit('exchangeConfig', config);
            }
        } catch (error) {
            console.error('Error sending initial data:', error);
        }
    });

    // Пинг-понг для поддержания соединения
    socket.on('ping', () => {
        socket.emit('pong');
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Client disconnected from exchange backend:', socket.id, reason);
        connectedClients.delete(socket.id);
    });
});

// Периодическая проверка соединения с админкой
setInterval(() => {
    if (!adminSocket.connected) {
        console.log('🔄 Attempting to reconnect to admin WebSocket...');
    }
}, 10000);

const PORT = process.env.PORT || 3013;
server.listen(PORT, () => {
    console.log(`🚀 Stock Exchange Trading Backend running on http://localhost:${PORT}`);
    console.log(`📊 API available at: http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket server running`);
    console.log(`📡 Connected to admin: ${adminUrl} (${adminSocket.connected ? 'connected' : 'disconnected'})`);
});