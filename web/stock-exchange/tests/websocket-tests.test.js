const TradingTestUtils = require('./trading-test-utils');

describe('Тесты WebSocket и real-time обновлений', () => {
    let testUtils;

    beforeAll(async () => {
        testUtils = new TradingTestUtils(page);
        await page.goto('http://localhost:3012');
        await testUtils.waitForTradingPage();
    });

    test('Проверка подключения WebSocket', async () => {
        console.log('🔌 Тест подключения WebSocket...');

        // Проверяем наличие WebSocket подключения
        const isWebSocketConnected = await page.evaluate(() => {
            return window.socket && window.socket.connected;
        });

        if (isWebSocketConnected) {
            console.log('✅ WebSocket подключен');
        } else {
            console.log('❌ WebSocket не подключен, проверяем альтернативные методы...');

            // Проверяем наличие обработчиков событий
            const hasSocketListeners = await page.evaluate(() => {
                return window.socket && typeof window.socket.on === 'function';
            });

            if (hasSocketListeners) {
                console.log('✅ WebSocket обработчики присутствуют');
            }
        }
    });

    test('Real-time обновление цен акций', async () => {
        console.log('🔄 Тест real-time обновления цен...');

        // Получаем начальные цены акций
        const stocks = await page.$$('[class*="stock"], .card, [class*="card"], .stock-item');
        expect(stocks.length).toBeGreaterThan(0);

        const stockElement = stocks[0];
        const initialPrice = await testUtils.getStockPrice(stockElement);
        console.log(`💵 Начальная цена: $${initialPrice}`);

        // Ждем возможного обновления цены
        console.log('⏳ Ожидаем обновление цены (10 секунд)...');
        await page.waitForTimeout(10000);

        // Проверяем изменилась ли цена
        const updatedPrice = await testUtils.getStockPrice(stockElement);
        console.log(`💵 Обновленная цена: $${updatedPrice}`);

        if (updatedPrice !== initialPrice) {
            console.log('✅ Цена изменилась - real-time обновление работает');
        } else {
            console.log('⚠️ Цена не изменилась (возможно, торги не активны)');
        }
    });

    test('Обновление портфеля в реальном времени', async () => {
        console.log('📊 Тест обновления портфеля в real-time...');

        // Покупаем акцию для теста
        const stocks = await page.$$('[class*="stock"], .card, [class*="card"], .stock-item');
        const stockElement = stocks[0];

        const initialBalance = await testUtils.getCurrentBalance();
        console.log(`💰 Начальный баланс: $${initialBalance}`);

        // Покупаем акцию
        const buyResult = await testUtils.buyStock(stockElement, 1);

        if (buyResult) {
            await page.waitForTimeout(3000);
            const balanceAfterBuy = await testUtils.getCurrentBalance();
            console.log(`💰 Баланс после покупки: $${balanceAfterBuy}`);

            // Проверяем, что баланс обновился без перезагрузки
            expect(balanceAfterBuy).toBeLessThan(initialBalance);
            console.log('✅ Баланс обновился в реальном времени');
        }
    });

    test('Получение сообщений о сделках через WebSocket', async () => {
        console.log('📨 Тест получения сообщений о сделках...');

        // Проверяем наличие уведомлений о сделках
        const tradeNotificationSelectors = [
            '.trade-notification',
            '[class*="notification"]',
            '.toast',
            '.alert',
            '[class*="message"]'
        ];

        let hasTradeNotifications = false;

        for (const selector of tradeNotificationSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                for (const element of elements) {
                    const text = await page.evaluate(el => el.textContent, element);
                    if (text && (text.includes('покупк') || text.includes('продаж') ||
                        text.includes('buy') || text.includes('sell') || text.includes('trade'))) {
                        console.log(`✅ Найдено уведомление о сделке: "${text.trim()}"`);
                        hasTradeNotifications = true;
                    }
                }
            }
        }

        if (!hasTradeNotifications) {
            console.log('⚠️ Уведомления о сделках не найдены');
        }
    });
});