import { Controller, Get, Put, Body, Post } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

/**
 * Контроллер для управления настройками биржи и торговлей
 */
@Controller('api')
export class ExchangeController {

    // Жестко заданные минимальная и максимальная даты
    private readonly MIN_TRADING_DATE = '11/07/2024';
    private readonly MAX_TRADING_DATE = '11/06/2025';

    constructor(
        private readonly dataService: DataService,
        private readonly websocketGateway: WebsocketGateway
    ) {}

    /**
     * POST /api/trading/buy
     * Покупка акций
     */
    @Post('trading/buy')
    async buyStock(@Body() tradeData: any) {
        try {
            console.log('🛒 Buy request:', tradeData);

            const data = await this.dataService.loadData();
            const brokerIndex = data.brokers.findIndex(b => b.id === parseInt(tradeData.brokerId));

            if (brokerIndex === -1) {
                throw new Error('Брокер не найден');
            }

            const broker = data.brokers[brokerIndex];
            const stock = data.stocks.find(s => s.symbol === tradeData.symbol);
            if (!stock) {
                throw new Error('Акция не найдена');
            }

            const totalCost = tradeData.price * tradeData.quantity;

            // Проверяем достаточно ли средств
            if (broker.currentBalance < totalCost) {
                throw new Error('Недостаточно средств');
            }

            // СОХРАНЯЕМ ВСЕ НАСТРОЙКИ АКЦИЙ ПЕРЕД ОБНОВЛЕНИЕМ
            const stocksSettings = data.stocks ? [...data.stocks] : [];
            const allBrokers = data.brokers ? [...data.brokers] : [];
            const exchangeConfig = data.exchangeConfig ? { ...data.exchangeConfig } : {};

            // Обновляем баланс только текущего брокера
            broker.currentBalance -= totalCost;

            // Обновляем портфель только текущего брокера
            if (!broker.portfolio) {
                broker.portfolio = {};
            }

            if (!broker.portfolio[tradeData.symbol]) {
                broker.portfolio[tradeData.symbol] = {
                    quantity: 0,
                    averagePrice: 0,
                    totalCost: 0
                };
            }

            const portfolioItem = broker.portfolio[tradeData.symbol];
            const newQuantity = portfolioItem.quantity + tradeData.quantity;
            const newTotalCost = portfolioItem.totalCost + totalCost;
            const newAveragePrice = newTotalCost / newQuantity;

            portfolioItem.quantity = newQuantity;
            portfolioItem.totalCost = newTotalCost;
            portfolioItem.averagePrice = newAveragePrice;

            // ВОССТАНАВЛИВАЕМ ВСЕ ДАННЫЕ ПЕРЕД СОХРАНЕНИЕМ
            data.brokers = allBrokers; // Все брокеры остаются
            data.stocks = stocksSettings; // Все настройки акций сохраняются
            data.exchangeConfig = exchangeConfig; // Конфигурация биржи сохраняется

            // Обновляем только текущего брокера
            data.brokers[brokerIndex] = broker;

            // Сохраняем данные
            await this.dataService.saveData(data);

            // Рассылаем обновление через WebSocket
            if (this.websocketGateway['broadcastBrokerUpdate']) {
                this.websocketGateway['broadcastBrokerUpdate'](broker.id);
            }

            console.log(`✅ Buy successful: ${tradeData.quantity} ${tradeData.symbol} for $${totalCost}`);

            return {
                success: true,
                message: `Успешно куплено ${tradeData.quantity} акций ${tradeData.symbol}`,
                totalCost: totalCost,
                broker: {
                    id: broker.id,
                    name: broker.name,
                    currentBalance: broker.currentBalance,
                    portfolio: broker.portfolio
                }
            };

        } catch (error) {
            console.error('❌ Buy error:', error);
            throw error;
        }
    }

    /**
     * POST /api/trading/sell
     * Продажа акций
     */
    @Post('trading/sell')
    async sellStock(@Body() tradeData: any) {
        try {
            console.log('💰 Sell request:', tradeData);

            const data = await this.dataService.loadData();
            const brokerIndex = data.brokers.findIndex(b => b.id === parseInt(tradeData.brokerId));

            if (brokerIndex === -1) {
                throw new Error('Брокер не найден');
            }

            const broker = data.brokers[brokerIndex];
            const stock = data.stocks.find(s => s.symbol === tradeData.symbol);
            if (!stock) {
                throw new Error('Акция не найдена');
            }

            // Проверяем есть ли акции в портфеле
            if (!broker.portfolio || !broker.portfolio[tradeData.symbol]) {
                throw new Error('Акции отсутствуют в портфеле');
            }

            const portfolioItem = broker.portfolio[tradeData.symbol];
            if (portfolioItem.quantity < tradeData.quantity) {
                throw new Error('Недостаточно акций для продажи');
            }

            const totalRevenue = tradeData.price * tradeData.quantity;

            // СОХРАНЯЕМ ВСЕ НАСТРОЙКИ АКЦИЙ ПЕРЕД ОБНОВЛЕНИЕМ
            const stocksSettings = data.stocks ? [...data.stocks] : [];
            const allBrokers = data.brokers ? [...data.brokers] : [];
            const exchangeConfig = data.exchangeConfig ? { ...data.exchangeConfig } : {};

            // Обновляем баланс только текущего брокера
            broker.currentBalance += totalRevenue;

            // Обновляем портфель только текущего брокера
            portfolioItem.quantity -= tradeData.quantity;
            portfolioItem.totalCost = portfolioItem.averagePrice * portfolioItem.quantity;

            // Если акций не осталось, удаляем из портфеля
            if (portfolioItem.quantity === 0) {
                delete broker.portfolio[tradeData.symbol];
            }

            // ВОССТАНАВЛИВАЕМ ВСЕ ДАННЫЕ ПЕРЕД СОХРАНЕНИЕМ
            data.brokers = allBrokers; // Все брокеры остаются
            data.stocks = stocksSettings; // Все настройки акций сохраняются
            data.exchangeConfig = exchangeConfig; // Конфигурация биржи сохраняется

            // Обновляем только текущего брокера
            data.brokers[brokerIndex] = broker;

            // Сохраняем данные
            await this.dataService.saveData(data);

            // Рассылаем обновление через WebSocket
            if (this.websocketGateway['broadcastBrokerUpdate']) {
                this.websocketGateway['broadcastBrokerUpdate'](broker.id);
            }

            console.log(`✅ Sell successful: ${tradeData.quantity} ${tradeData.symbol} for $${totalRevenue}`);

            return {
                success: true,
                message: `Успешно продано ${tradeData.quantity} акций ${tradeData.symbol}`,
                totalRevenue: totalRevenue,
                broker: {
                    id: broker.id,
                    name: broker.name,
                    currentBalance: broker.currentBalance,
                    portfolio: broker.portfolio
                }
            };

        } catch (error) {
            console.error('❌ Sell error:', error);
            throw error;
        }
    }

    /**
     * GET /api/exchange/config
     * Возвращает текущую конфигурацию биржи
     */
    @Get('exchange/config')
    async getConfig() {
        try {
            const data = await this.dataService.loadData();
            const config = { ...data.exchangeConfig };

            // Добавляем русскую дату для отображения в интерфейсе
            if (config.currentDate) {
                config.russianDate = this.formatDateToRussian(config.currentDate);
            }
            return config;
        } catch (error) {
            console.error('❌ Error loading exchange config:', error);
            throw error;
        }
    }

    /**
     * GET /api/exchange/date-range
     * Возвращает допустимый диапазон дат для торгов
     */
    @Get('exchange/date-range')
    async getDateRange() {
        return {
            minDate: this.MIN_TRADING_DATE,
            maxDate: this.MAX_TRADING_DATE
        };
    }

    /**
     * PUT /api/exchange/config
     * Обновляет конфигурацию биржи с валидацией дат
     */
    @Put('exchange/config')
    async updateConfig(@Body() updates: any) {
        // СОХРАНЯЕМ ОРИГИНАЛЬНЫЕ ДАННЫЕ ДО ЛЮБЫХ ИЗМЕНЕНИЙ
        const originalData = await this.dataService.loadData();
        
        try {
            const data = await this.dataService.loadData();

            // ВАЛИДИРУЕМ ДАТУ ПЕРЕД ЛЮБЫМИ ИЗМЕНЕНИЯМИ
            if (updates.startDate !== undefined && updates.startDate && updates.startDate !== '') {
                const validation = this.validateTradingDate(updates.startDate);
                if (!validation.isValid) {
                    throw new Error(validation.error || 'Неверная дата начала торгов');
                }
            }

            // СОХРАНЯЕМ ВСЕ ДАННЫЕ ПЕРЕД ОБНОВЛЕНИЕМ
            const allBrokers = data.brokers ? [...data.brokers] : [];
            const stocksSettings = data.stocks ? [...data.stocks] : [];

            // Обновляем дату начала торгов если передана (после успешной валидации)
            if (updates.startDate !== undefined) {
                if (updates.startDate && updates.startDate !== '') {
                    data.exchangeConfig.startDate = updates.startDate;
                    console.log(`✅ Date set to: ${updates.startDate}`);
                } else if (updates.startDate === '') {
                    data.exchangeConfig.startDate = null;
                    console.log('✅ Date cleared');
                }
            }

            // Обновляем скорость торгов если передана
            if (updates.speed !== undefined) {
                data.exchangeConfig.speed = updates.speed;
            }

            // Обрабатываем запуск/остановку торгов
            if (updates.isTrading !== undefined) {
                data.exchangeConfig.isTrading = updates.isTrading;

                if (updates.isTrading) {
                    // Сбрасываем индекс даты при запуске торгов
                    data.exchangeConfig.currentDateIndex = 0;
                    data.exchangeConfig.currentDate = null;

                    // Запускаем симуляцию торгов через WebSocket
                    if (this.websocketGateway.startTradingSimulation) {
                        this.websocketGateway.startTradingSimulation();
                    }
                } else {
                    // Останавливаем симуляцию торгов
                    if (this.websocketGateway.stopTradingSimulation) {
                        this.websocketGateway.stopTradingSimulation();
                    }
                }
            }

            // ВОССТАНАВЛИВАЕМ ВСЕ ДАННЫЕ ПЕРЕД СОХРАНЕНИЕМ
            data.brokers = allBrokers; // Все брокеры остаются
            data.stocks = stocksSettings; // Все настройки акций сохраняются

            // Сохраняем обновленную конфигурацию
            await this.dataService.saveData(data);

            const config = { ...data.exchangeConfig };
            if (config.currentDate) {
                config.russianDate = this.formatDateToRussian(config.currentDate);
            }

            return config;

        } catch (error) {
            // ВОССТАНАВЛИВАЕМ ОРИГИНАЛЬНЫЕ ДАННЫЕ ПРИ ОШИБКЕ
            console.error('❌ Error updating exchange config, restoring original data...', error);
            await this.dataService.saveData(originalData);
            throw error;
        }
    }

    /**
     * Валидирует дату начала торгов
     */
    private validateTradingDate(dateStr: string): { isValid: boolean; error?: string } {
        // Проверяем формат даты
        if (!this.isValidDateFormat(dateStr)) {
            return { 
                isValid: false, 
                error: 'Неверный формат даты. Используйте ММ/ДД/ГГГГ (например: 01/15/2023)' 
            };
        }

        // Парсим даты для сравнения
        const inputDate = this.parseDate(dateStr);
        const minDate = this.parseDate(this.MIN_TRADING_DATE);
        const maxDate = this.parseDate(this.MAX_TRADING_DATE);

        if (!inputDate) {
            return { isValid: false, error: 'Неверная дата' };
        }

        // Проверяем что дата в допустимом диапазоне
        if (inputDate < minDate!) {
            return { 
                isValid: false, 
                error: `Дата не может быть раньше ${this.MIN_TRADING_DATE}. Минимальная дата: ${this.MIN_TRADING_DATE}` 
            };
        }

        if (inputDate > maxDate!) {
            return { 
                isValid: false, 
                error: `Дата не может быть позже ${this.MAX_TRADING_DATE}. Максимальная дата: ${this.MAX_TRADING_DATE}` 
            };
        }

        // Проверяем что это рабочий день (не выходной)
        if (inputDate.getDay() === 0 || inputDate.getDay() === 6) {
            return { 
                isValid: false, 
                error: 'Дата приходится на выходной день. Выберите рабочий день (понедельник-пятница)' 
            };
        }

        return { isValid: true };
    }

    /**
     * Проверяет валидность формата даты ММ/ДД/ГГГГ
     */
    private isValidDateFormat(dateStr: string): boolean {
        if (!dateStr || dateStr.length !== 10) return false;

        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(20[0-9]{2})$/;
        return dateRegex.test(dateStr);
    }

    /**
     * Проверяет валидность даты в формате ММ/ДД/ГГГГ
     * @param dateStr - строка даты для проверки
     */
    private isValidDate(dateStr: string): boolean {
        if (!dateStr || dateStr.length !== 10) return false;

        try {
            const [month, day, year] = dateStr.split('/').map(part => parseInt(part));

            // Проверяем что все части числа
            if (isNaN(month) || isNaN(day) || isNaN(year)) return false;

            // Проверяем диапазоны
            if (month < 1 || month > 12) return false;
            if (day < 1 || day > 31) return false;
            if (year < 2000 || year > 2030) return false;

            // Проверяем конкретную дату
            const date = new Date(year, month - 1, day);
            return date.getDate() === day &&
                date.getMonth() === month - 1 &&
                date.getFullYear() === year;
        } catch {
            return false;
        }
    }

    /**
     * Парсит строку даты в Date объект
     */
    private parseDate(dateStr: string): Date | null {
        try {
            const [month, day, year] = dateStr.split('/').map(part => parseInt(part));
            const date = new Date(year, month - 1, day);
            
            // Проверяем что дата корректно создалась
            if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
                return date;
            }
            return null;
        } catch {
            return null;
        }
    }

    /**
     * Форматирует дату из ММ/ДД/ГГГГ в русский формат ДД.ММ.ГГГГ
     * @param dateStr - строка даты в формате ММ/ДД/ГГГГ
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
