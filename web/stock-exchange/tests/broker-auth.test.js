const TradingTestUtils = require('./trading-test-utils');

describe('Авторизация брокера', () => {
  let testUtils;

  beforeAll(async () => {
    testUtils = new TradingTestUtils(page);
  });

  test('Выбор брокера и переход на торговую площадку', async () => {
    console.log('🌐 Переходим на страницу биржи...');
    await page.goto('http://localhost:3012', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Проверяем, что мы на странице выбора брокера
    const pageTitle = await page.title();
    expect(pageTitle).toBe('Stock Exchange');
    
    const heading = await page.$('h1');
    const headingText = heading ? await page.evaluate(el => el.textContent, heading) : '';
    expect(headingText).toContain('Вход в биржу');

    // Ищем брокеров
    const brokers = await page.$$('[class*="broker"], .broker-card, .broker');
    expect(brokers.length).toBeGreaterThan(0);
    console.log(` Найдено брокеров: ${brokers.length}`);

    // Выбираем первого брокера
    const firstBroker = brokers[0];
    const brokerText = await page.evaluate(el => el.textContent, firstBroker);
    console.log(` Выбираем брокера: ${brokerText.substring(0, 50)}...`);

    // Кликаем на брокера
    await firstBroker.click();
    
    // Ждем перехода на торговую площадку
    await page.waitForTimeout(5000);

    // Проверяем, что перешли на торговую площадку
    const currentUrl = page.url();
    console.log(`🔗 Текущий URL: ${currentUrl}`);

    // Получаем баланс после авторизации
    const balance = await testUtils.getCurrentBalance();
    expect(balance).toBeGreaterThan(0);
    console.log(`💰 Баланс после авторизации: $${balance}`);

    // Проверяем наличие акций
    const stocks = await page.$$('[class*="stock"], .card, [class*="card"]');
    expect(stocks.length).toBeGreaterThan(0);
    console.log(`📈 Найдено акций: ${stocks.length}`);
  });
});