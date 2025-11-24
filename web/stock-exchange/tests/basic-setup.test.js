const TradingTestUtils = require('./trading-test-utils');

describe('Базовые тесты системы', () => {
  let testUtils;

  beforeAll(async () => {
    testUtils = new TradingTestUtils(page);
    
    // Переходим на страницу торговой площадки
    console.log('🌐 Переходим на страницу биржи...');
    await page.goto('http://localhost:3012', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await testUtils.waitForTradingPage();
  });

  test('Система запущена и доступна', async () => {
    // Проверяем, что страница загружена
    const title = await page.title();
    expect(title).toBeDefined();
    console.log(`📄 Заголовок страницы: "${title}"`);
    
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3012');
    console.log(`🔗 Текущий URL: ${currentUrl}`);
    
    // Проверяем баланс
    const balance = await testUtils.getCurrentBalance();
    expect(balance).toBeGreaterThan(0);
    console.log(`💰 Начальный баланс: $${balance}`);
  });

  test('Акции загружены', async () => {
    // Ищем любые элементы, которые могут быть акциями
    const possibleStockElements = await page.$$('[class*="stock"], .card, [class*="card"], [class*="item"]');
    expect(possibleStockElements.length).toBeGreaterThan(0);
    console.log(`📈 Найдено возможных элементов акций: ${possibleStockElements.length}`);
    
    // Проверяем несколько известных акций
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
    let foundSymbols = 0;
    
    for (const symbol of symbols) {
      const stockElement = await testUtils.findStockBySymbol(symbol);
      if (stockElement) {
        foundSymbols++;
        console.log(`✅ Акция ${symbol} найдена`);
        
        // Пробуем получить цену
        const price = await testUtils.getStockPrice(stockElement);
        if (price > 0) {
          console.log(`💵 Цена ${symbol}: $${price}`);
        }
      } else {
        console.log(`❌ Акция ${symbol} не найдена`);
      }
    }
    
    console.log(`📊 Найдено акций: ${foundSymbols} из ${symbols.length}`);
    expect(foundSymbols).toBeGreaterThan(0);
  });

  test('Портфель отображается', async () => {
    // Ищем раздел портфеля
    const portfolioSelectors = [
      '.portfolio-section',
      '.portfolio',
      '[class*="portfolio"]',
      '.positions',
      '[class*="position"]'
    ];
    
    let portfolioFound = false;
    for (const selector of portfolioSelectors) {
      const element = await page.$(selector);
      if (element) {
        portfolioFound = true;
        console.log(`✅ Раздел портфеля найден: ${selector}`);
        break;
      }
    }
    
    expect(portfolioFound).toBe(true);
  });
});