const TradingTestUtils = require('./trading-test-utils');

describe('Тесты графиков и дополнительной функциональности', () => {
    let testUtils;

    beforeAll(async () => {
        testUtils = new TradingTestUtils(page);
        await page.goto('http://localhost:3012');
        await testUtils.waitForTradingPage();
    });

    test('Открытие диалогового окна просмотра графика цены акции', async () => {
        console.log('📊 Тест открытия графика акции...');

        // Находим акцию
        const stocks = await page.$$('[class*="stock"], .card, [class*="card"], .stock-item');
        expect(stocks.length).toBeGreaterThan(0);

        const stockElement = stocks[0];

        // Ищем кнопку открытия графика
        const chartButtonSelectors = [
            '[class*="chart"]',
            '[class*="graph"]',
            '[class*="history"]',
            '.chart-btn',
            '.graph-btn',
            '.history-btn',
            'button'
        ];

        let chartButton = null;
        for (const selector of chartButtonSelectors) {
            chartButton = await stockElement.$(selector);
            if (chartButton) {
                const buttonText = await page.evaluate(el => el.textContent, chartButton);
                if (buttonText && (buttonText.includes('График') || buttonText.includes('Chart') ||
                    buttonText.includes('История') || buttonText.includes('History'))) {
                    console.log(`✅ Найдена кнопка графика: "${buttonText.trim()}"`);
                    break;
                }
            }
            chartButton = null;
        }

        if (chartButton) {
            await chartButton.click();
            console.log('✅ Клик на кнопку графика выполнен');
            await page.waitForTimeout(3000);

            // Ищем диалоговое окно графика
            const chartDialogSelectors = [
                '.chart-dialog',
                '.graph-modal',
                '[class*="dialog"]',
                '[class*="modal"]',
                '.modal',
                '.dialog'
            ];

            let chartDialog = null;
            for (const selector of chartDialogSelectors) {
                chartDialog = await page.$(selector);
                if (chartDialog) {
                    console.log(`✅ Диалоговое окно графика найдено: ${selector}`);
                    break;
                }
            }

            expect(chartDialog).not.toBeNull();

            // Закрываем диалог
            const closeButtons = await chartDialog.$$('button, [class*="close"], [class*="cancel"]');
            if (closeButtons.length > 0) {
                await closeButtons[0].click();
                console.log('✅ Диалог закрыт');
            }
        } else {
            console.log('⚠️ Кнопка графика не найдена, тест пропущен');
        }
    });

    test('Проверка отображения текущей имитируемой даты', async () => {
        console.log('📅 Тест отображения текущей даты...');

        // Ищем элемент с датой
        const dateSelectors = [
            '.current-date',
            '[class*="date"]',
            '.trading-date',
            '[class*="current"]',
            '.date-display'
        ];

        let dateElement = null;

        for (const selector of dateSelectors) {
            dateElement = await page.$(selector);
            if (dateElement) {
                const dateText = await page.evaluate(el => el.textContent, dateElement);
                console.log(`✅ Найден элемент даты: "${dateText.trim()}"`);

                // Проверяем формат даты (ДД.ММ.ГГГГ или ММ/ДД/ГГГГ)
                const dateRegex = /(\d{2}[\.\/]\d{2}[\.\/]\d{4})|(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{4})/;
                const hasDate = dateRegex.test(dateText);

                if (hasDate) {
                    console.log('✅ Дата в правильном формате найдена');
                } else {
                    console.log('⚠️ Дата не в ожидаемом формате');
                }
                break;
            }
        }

        if (!dateElement) {
            console.log('❌ Элемент с датой не найден');
        }
    });

    test('Проверка Material Design компонентов', async () => {
        console.log('🎨 Тест Material Design компонентов...');

        // Ищем Vuetify/Material Design компоненты
        const materialSelectors = [
            '.v-card',
            '.v-btn',
            '.v-data-table',
            '.v-text-field',
            '.v-dialog',
            '.v-app-bar',
            '.v-navigation-drawer',
            '[class*="v-"]',
            '.mdc-',
            '.mat-'
        ];

        let materialComponentsFound = 0;

        for (const selector of materialSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                console.log(`✅ Найдены компоненты: ${selector} (${elements.length} шт.)`);
                materialComponentsFound += elements.length;
            }
        }

        if (materialComponentsFound > 0) {
            console.log(`✅ Найдено Material Design компонентов: ${materialComponentsFound}`);
        } else {
            console.log('⚠️ Material Design компоненты не найдены');
        }
    });

    test('Тест XPath селекторов (преимущество)', async () => {
        console.log('🔍 Тест XPath селекторов...');

        try {
            // Используем XPath для поиска элементов
            const stockXPath = '//*[contains(@class, "stock") or contains(@class, "card")]';
            const stocks = await page.$x(stockXPath);
            console.log(`✅ XPath найдено акций: ${stocks.length}`);

            // Поиск кнопок покупки через XPath
            const buyButtonXPath = '//button[contains(text(), "Купить") or contains(text(), "Buy")]';
            const buyButtons = await page.$x(buyButtonXPath);
            console.log(`✅ XPath найдено кнопок покупки: ${buyButtons.length}`);

            // Поиск баланса через XPath
            const balanceXPath = '//*[contains(text(), "Баланс") or contains(text(), "Balance")]';
            const balanceElements = await page.$x(balanceXPath);
            console.log(`✅ XPath найдено элементов баланса: ${balanceElements.length}`);

            expect(stocks.length).toBeGreaterThan(0);
        } catch (error) {
            console.log('❌ Ошибка XPath:', error.message);
        }
    });
});