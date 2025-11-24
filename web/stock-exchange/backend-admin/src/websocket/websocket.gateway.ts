import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DataService } from '../data/data.service';
import { StocksService } from '../stocks/stocks.service';
import { StocksDataService } from '../data/stocks-data.service';

/**
 * WebSocket шлюз для реального времени
 */

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3010', 'http://localhost:3012', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
    },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server; // Экземпляр Socket.io сервера

    // Приватные переменные для управления симуляцией торгов
    private tradingInterval: NodeJS.Timeout | null = null; // Интервал симуляции
    private stockHistories: Map<string, any[]> = new Map(); // Кэш исторических данных
    private allTradingDates: string[] = []; // Все доступные даты торгов

    constructor(
        private readonly dataService: DataService,
        private readonly stocksService: StocksService,
        private readonly stocksDataService: StocksDataService
    ) {}

    /**
     * Инициализация WebSocket сервера после создания
     * Вызывается автоматически NestJS
     */
    afterInit(server: Server) {
        this.server = server;
        console.log('✅ WebSocket server initialized');
    }

    /**
     * Обработчик подключения нового клиента
     * Вызывается когда клиент (браузер) подключается к WebSocket
     */
    handleConnection(client: Socket) {
        console.log('✅ Client connected:', client.id);
        // Отправляем подтверждение подключения клиенту
        client.emit('connected', { message: 'Connected to WebSocket', id: client.id });
    }

    /**
     * Обработчик отключения клиента
     * Вызывается когда клиент отключается от WebSocket
     */
    handleDisconnect(client: Socket) {
        console.log('❌ Client disconnected:', client.id);
    }

    /**
     * Обработчик сообщения 'startTrading' от клиента
     * Клиенты могут запрашивать запуск торгов через WebSocket
     */
    @SubscribeMessage('startTrading')
    async handleStartTrading() {
        console.log('🚀 Starting trading simulation...');
        await this.startTradingSimulation();
    }

    /**
     * Обработчик сообщения 'stopTrading' от клиента
     * Клиенты могут запрашивать остановку торгов через WebSocket
     */
    @SubscribeMessage('stopTrading')
    async handleStopTrading() {
        console.log('🛑 Stopping trading simulation...');
        this.stopTradingSimulation();
    }

    /**
     * Обработчик сообщения 'tradeExecuted' от клиента
     * Рассылает информацию о сделке всем клиентам
     */
    @SubscribeMessage('tradeExecuted')
    async handleTradeExecuted(client: Socket, tradeData: any) {
        console.log('💰 Trade executed, broadcasting:', tradeData);

        // Рассылаем информацию о сделке всем клиентам
        this.server.emit('trade', {
            ...tradeData,
            timestamp: new Date().toISOString()
        });

        // Также рассылаем обновленные данные брокера
        await this.broadcastBrokerUpdate(tradeData.brokerId);
    }

    /**
     * Рассылает обновленные данные брокера всем клиентам
     */
    async broadcastBrokerUpdate(brokerId: number) {
        try {
            const data = await this.dataService.loadData();
            const broker = data.brokers.find(b => b.id === brokerId);

            if (broker) {
                console.log('🔄 Broadcasting broker update:', broker.name);
                this.server.emit('brokerUpdate', {
                    brokerId: broker.id,
                    balance: broker.currentBalance,
                    portfolio: broker.portfolio,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('❌ Error broadcasting broker update:', error);
        }
    }

    /**
     * Запускает симуляцию торгов с заданными параметрами
     * Это основная функция имитации биржевых торгов
     */
    async startTradingSimulation() {
        // Останавливаем предыдущую симуляцию если она запущена
        if (this.tradingInterval) {
            clearInterval(this.tradingInterval);
            console.log('🔄 Clearing existing trading interval');
        }

        console.log('📊 Initializing stocks for trading...');
        await this.stocksService.initializeStocksForTrading();

        // Загружаем исторические данные для всех акций в память
        await this.loadStockHistories();

        // Инициализируем даты торгов с учетом выбранной даты начала
        await this.initializeTradingDates();

        // Загружаем текущую конфигурацию
        const data = await this.dataService.loadData();
        console.log('📈 Loaded data for trading:', {
            stocksCount: data.stocks?.length,
            brokersCount: data.brokers?.length,
            isTrading: data.exchangeConfig?.isTrading,
            speed: data.exchangeConfig?.speed,
            startDate: data.exchangeConfig?.startDate
        });

        // Обновляем статус торгов в реальном времени
        data.exchangeConfig.isTrading = true;
        await this.dataService.saveData(data);

        // Рассылаем обновление конфигурации
        this.server.emit('exchangeConfig', data.exchangeConfig);

        // Проверяем что брокеры не потерялись
        if (!data.brokers || data.brokers.length === 0) {
            console.error('❌ No brokers found! This should not happen.');
        }

        const speed = data.exchangeConfig.speed || 1;

        console.log(`🚀 Starting trading simulation with speed: ${speed}s`);
        console.log(`📅 Total trading dates: ${this.allTradingDates.length}`);

        /**
         * ЗАПУСК ИНТЕРВАЛА СИМУЛЯЦИИ:
         * Каждые N секунд (скорость) переходим к следующему торговому дню
         * и обновляем цены акций согласно историческим данным
         */
        this.tradingInterval = setInterval(async () => {
            try {
                const currentData = await this.dataService.loadData();

                // Проверяем не остановлены ли торги через настройки
                if (!currentData.exchangeConfig.isTrading) {
                    console.log('🛑 Trading stopped by config');
                    this.stopTradingSimulation();
                    return;
                }

                // Проверяем что брокеры на месте (защита от потери данных)
                if (!currentData.brokers || currentData.brokers.length === 0) {
                    console.error('❌ Brokers were lost during trading!');
                    this.stopTradingSimulation();
                    return;
                }

                const currentIndex = currentData.exchangeConfig.currentDateIndex || 0;

                // Проверяем не достигли ли конца исторических данных
                if (currentIndex >= this.allTradingDates.length) {
                    console.log('🏁 Reached end of trading dates, stopping simulation');
                    this.stopTradingSimulation();
                    return;
                }

                const currentDate = this.allTradingDates[currentIndex];
                const nextIndex = currentIndex + 1;

                console.log(`📅 Trading date: ${currentDate} (index ${currentIndex})`);

                // Обновляем только индекс даты и текущую дату в конфигурации
                currentData.exchangeConfig.currentDateIndex = nextIndex;
                currentData.exchangeConfig.currentDate = currentDate;

                const activeStocks = currentData.stocks?.filter(stock => stock.isActive) || [];
                console.log(`📊 Active stocks: ${activeStocks.length}`);

                // Если нет активных акций, просто обновляем дату
                if (activeStocks.length === 0) {
                    console.log('⚠️ No active stocks for trading');
                    await this.dataService.saveData(currentData);
                    return;
                }

                // Получаем обновления цен для текущей даты из исторических данных
                const priceUpdates = await this.getPriceUpdatesForDate(activeStocks, currentDate, currentIndex);

                // Обновляем только цены акций, не трогая брокеров
                if (currentData.stocks) {
                    currentData.stocks = currentData.stocks.map(stock => {
                        const update = priceUpdates.find(p => p.symbol === stock.symbol);
                        if (update) {
                            return {
                                ...stock,
                                price: update.price,
                                change: update.change,
                                changePercent: update.changePercent
                            };
                        }
                        return stock;
                    });
                }

                console.log('💾 Saving updated data (preserving brokers)...');
                await this.dataService.saveData(currentData);

                /**
                 * ОТПРАВКА ОБНОВЛЕНИЙ ВСЕМ КЛИЕНТАМ:
                 * WebSocket позволяет отправить данные всем подключенным клиентам одновременно
                 * без необходимости индивидуальных запросов
                 */
                if (priceUpdates.length > 0) {
                    console.log(`📈 Sending ${priceUpdates.length} price updates to all clients`);
                    this.server.emit('priceUpdate', {
                        date: currentDate,
                        russianDate: this.formatDateToRussian(currentDate),
                        prices: priceUpdates,
                    });
                }

            } catch (error) {
                console.error('❌ Trading simulation error:', error);
                this.stopTradingSimulation();
            }
        }, 1000 * speed); // Интервал в зависимости от скорости (1, 2, 5 секунд)
    }

    /**
     * Загружает исторические данные для всех акций в память для быстрого доступа
     */
    private async loadStockHistories() {
        console.log('📚 Loading stock histories...');
        const data = await this.dataService.loadData();

        for (const stock of data.stocks) {
            try {
                const history = await this.stocksDataService.loadStockHistory(stock.symbol);
                // Нормализуем даты в истории для единообразия (все в ММ/ДД/ГГГГ)
                const normalizedHistory = history.map(item => ({
                    ...item,
                    normalizedDate: this.normalizeDate(item.date)
                }));
                this.stockHistories.set(stock.symbol, normalizedHistory);
                console.log(`📖 Loaded ${history.length} history records for ${stock.symbol}`);
            } catch (error) {
                console.error(`❌ Failed to load history for ${stock.symbol}:`, error);
            }
        }
    }

    /**
     * Инициализирует список всех торговых дат с учетом даты начала
     * Собирает все уникальные даты из всех исторических данных
     */
    private async initializeTradingDates() {
        const data = await this.dataService.loadData();
        const startDate = data.exchangeConfig.startDate;

        // Собираем все уникальные даты из всех исторических данных
        const allDates = new Set<string>();

        for (const [symbol, history] of this.stockHistories) {
            for (const item of history) {
                if (item.normalizedDate) {
                    allDates.add(item.normalizedDate);
                }
            }
        }

        // Сортируем даты в хронологическом порядке
        let sortedDates = Array.from(allDates).sort((a, b) => {
            return new Date(a).getTime() - new Date(b).getTime();
        });

        // Если указана дата начала, фильтруем даты (только с этой даты и позже)
        if (startDate) {
            const normalizedStartDate = this.normalizeDate(startDate);
            console.log(`📅 Filtering dates from: ${normalizedStartDate}`);
            sortedDates = sortedDates.filter(date =>
                new Date(date) >= new Date(normalizedStartDate)
            );
        }

        // Если нет данных, генерируем даты по умолчанию
        if (sortedDates.length === 0) {
            console.log('⚠️ No trading dates found, using default dates');
            sortedDates = this.generateDefaultDates();
        }

        this.allTradingDates = sortedDates;
        console.log(`📅 Initialized ${this.allTradingDates.length} trading dates`);
    }

    /**
     * Генерирует даты по умолчанию если исторические данные не найдены
     */
    private generateDefaultDates(): string[] {
        const dates: string[] = [];
        const startDate = new Date('2023-01-01');

        // Генерируем 100 торговых дней
        for (let i = 0; i < 100; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            // Пропускаем выходные (только рабочие дни)
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                dates.push(this.formatDateMMDDYYYY(date));
            }
        }

        return dates;
    }

    /**
     * Нормализует дату в единый формат ММ/ДД/ГГГГ
     * Обрабатывает разные форматы дат из исторических данных
     */
    private normalizeDate(dateStr: string): string {
        if (!dateStr) return '';

        try {
            let date: Date;

            if (dateStr.includes('/')) {
                // Формат ММ/ДД/ГГГГ
                const [month, day, year] = dateStr.split('/').map(part => parseInt(part));
                date = new Date(year, month - 1, day);
            } else if (dateStr.includes('-')) {
                // Формат ГГГГ-ММ-ДД
                date = new Date(dateStr);
            } else {
                // Другие форматы
                date = new Date(dateStr);
            }

            if (isNaN(date.getTime())) {
                console.warn(`⚠️ Invalid date format: ${dateStr}`);
                return '';
            }

            return this.formatDateMMDDYYYY(date);
        } catch (error) {
            console.warn(`⚠️ Error parsing date ${dateStr}:`, error);
            return '';
        }
    }

    /**
     * Форматирует Date объект в строку ММ/ДД/ГГГГ
     */
    private formatDateMMDDYYYY(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    /**
     * Получает обновления цен для конкретной даты
     * Использует реальные исторические данные для расчета изменений
     */
    private async getPriceUpdatesForDate(activeStocks: any[], date: string, dateIndex: number) {
        const priceUpdates = [];

        for (const stock of activeStocks) {
            const history = this.stockHistories.get(stock.symbol);

            // Если нет исторических данных, используем случайные изменения
            if (!history || history.length === 0) {
                console.log(`⚠️ No history data for ${stock.symbol}, using random price`);
                const change = (Math.random() - 0.5) * 10;
                const newPrice = Math.max(1, (stock.price || 100) + change);
                const changePercent = (change / (stock.price || 100)) * 100;

                priceUpdates.push({
                    symbol: stock.symbol,
                    price: parseFloat(newPrice.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2)),
                    date: date,
                    russianDate: this.formatDateToRussian(date)
                });
                continue;
            }

            // Ищем исторические данные для текущей даты
            const historyRecord = history.find(item => item.normalizedDate === date);
            if (historyRecord) {
                const currentPrice = historyRecord.price || historyRecord.open;
                const previousPrice = this.getPreviousPrice(stock.symbol, dateIndex);
                const change = currentPrice - previousPrice;
                const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

                priceUpdates.push({
                    symbol: stock.symbol,
                    price: parseFloat(currentPrice.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2)),
                    date: date,
                    russianDate: this.formatDateToRussian(date)
                });
            } else {
                // Если нет данных для этой даты, используем предыдущую цену
                console.log(`⚠️ No price data for ${stock.symbol} on ${date}, using previous price`);
                priceUpdates.push({
                    symbol: stock.symbol,
                    price: stock.price,
                    change: 0,
                    changePercent: 0,
                    date: date,
                    russianDate: this.formatDateToRussian(date)
                });
            }
        }

        return priceUpdates;
    }

    /**
     * Находит цену акции для предыдущего торгового дня
     * Используется для расчета изменений цены
     */
    private getPreviousPrice(symbol: string, currentDateIndex: number): number {
        // Для первого дня используем начальную цену
        if (currentDateIndex === 0) {
            const data = this.stockHistories.get(symbol);
            return data && data.length > 0 ? (data[0].price || data[0].open || 100) : 100;
        }

        // Ищем предыдущую дату с данными (могут быть пропуски в данных)
        for (let i = currentDateIndex - 1; i >= 0; i--) {
            const previousDate = this.allTradingDates[i];
            const history = this.stockHistories.get(symbol);
            if (history) {
                const previousRecord = history.find(item => item.normalizedDate === previousDate);
                if (previousRecord) {
                    return previousRecord.price || previousRecord.open || 100;
                }
            }
        }

        return 100; // Значение по умолчанию
    }

    /**
     * Останавливает симуляцию торгов и очищает ресурсы
     */
    stopTradingSimulation() {
        if (this.tradingInterval) {
            clearInterval(this.tradingInterval);
            this.tradingInterval = null;
            this.stockHistories.clear();
            this.allTradingDates = [];
            console.log('🛑 Trading simulation stopped');

            // Обновляем статус торгов в реальном времени
            this.updateTradingStatus(false);
        }
    }

    /**
     * Обновляет статус торгов и рассылает обновление
     */
    private async updateTradingStatus(isTrading: boolean) {
        try {
            const data = await this.dataService.loadData();
            data.exchangeConfig.isTrading = isTrading;
            await this.dataService.saveData(data);

            // Рассылаем обновление конфигурации
            this.server.emit('exchangeConfig', data.exchangeConfig);
            console.log(`📢 Trading status updated: ${isTrading ? 'ACTIVE' : 'PAUSED'}`);
        } catch (error) {
            console.error('❌ Error updating trading status:', error);
        }
    }

    /**
     * Форматирует дату из ММ/ДД/ГГГГ в русский формат ДД.ММ.ГГГГ
     * Для отображения в интерфейсе
     */
    private formatDateToRussian(dateStr: string): string {
        if (!dateStr) return 'Не установлена';
        try {
            const [month, day, year] = dateStr.split('/');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateStr;
        }
    }
}