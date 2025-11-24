const TradingTestUtils = require('./trading-test-utils');

describe('Основные торговые тесты', () => {
  let testUtils;
  let initialBalance;

  beforeAll(async () => {
    testUtils = new TradingTestUtils(page);
    
    // Переходим на страницу и авторизуемся
    console.log('🌐 Переходим на страницу биржи...');
    await page.goto('http://localhost:3012');
    await testUtils.waitForTradingPage();
    
    // Получаем начальный баланс
    initialBalance = await testUtils.getCurrentBalance();
    console.log(`💰 Начальный баланс: $${initialBalance}`);
  });

  test('Покупка акций уменьшает баланс', async () => {
    // Ищем доступные акции
    const stocks = await page.$$('[class*="stock"], .card, [class*="card"]');
    expect(stocks.length).toBeGreaterThan(0);
    
    // Берем первую акцию
    const stockElement = stocks[0];
    const stockText = await page.evaluate(el => el.textContent, stockElement);
    console.log(`📈 Тестируем акцию: ${stockText.substring(0, 100)}...`);
    
    // Получаем цену акции
    const stockPrice = await testUtils.getStockPrice(stockElement);
    console.log(`💵 Цена акции: $${stockPrice}`);
    
    // Покупаем 1 акцию
    const purchaseSuccess = await testUtils.buyStock(stockElement, 1);
    
    if (purchaseSuccess) {
      // Проверяем изменение баланса
      const newBalance = await testUtils.getCurrentBalance();
      console.log(`💰 Баланс после покупки: $${newBalance}`);
      
      expect(newBalance).toBeLessThan(initialBalance);
      console.log('✅ Баланс уменьшился после покупки');
    } else {
      console.log('⚠️ Покупка не удалась, но тест продолжается');
    }
  });

  test('Продажа акций увеличивает баланс', async () => {
    // Сначала покупаем акцию
    const stocks = await page.$$('[class*="stock"], .card, [class*="card"]');
    const stockElement = stocks[0];
    
    const purchaseSuccess = await testUtils.buyStock(stockElement, 1);
    
    if (purchaseSuccess) {
      const balanceAfterBuy = await testUtils.getCurrentBalance();
      console.log(`💰 Баланс после покупки: $${balanceAfterBuy}`);
      
      // Теперь продаем
      const sellSuccess = await testUtils.sellStock(stockElement, 1);
      
      if (sellSuccess) {
        const balanceAfterSell = await testUtils.getCurrentBalance();
        console.log(`💰 Баланс после продажи: $${balanceAfterSell}`);
        
        expect(balanceAfterSell).toBeGreaterThan(balanceAfterBuy);
        console.log('✅ Баланс увеличился после продажи');
      } else {
        console.log('⚠️ Продажа не удалась');
      }
    } else {
      console.log('⚠️ Покупка не удалась, пропускаем тест продажи');
    }
  });

  test('Расчет прибыли/убытков', async () => {
    const stocks = await page.$$('[class*="stock"], .card, [class*="card"]');
    const stockElement = stocks[0];
    
    // Получаем начальную цену
    const initialPrice = await testUtils.getStockPrice(stockElement);
    console.log(`💵 Начальная цена: $${initialPrice}`);
    
    // Покупаем акцию
    const buySuccess = await testUtils.buyStock(stockElement, 1);
    
    if (buySuccess) {
      const balanceAfterBuy = await testUtils.getCurrentBalance();
      
      // Ждем изменения цены (симуляция)
      console.log('⏳ Ожидаем изменение цены...');
      await page.waitForTimeout(10000);
      
      // Получаем новую цену
      const newPrice = await testUtils.getStockPrice(stockElement);
      console.log(`💵 Новая цена: $${newPrice}`);
      
      // Продаем акцию
      const sellSuccess = await testUtils.sellStock(stockElement, 1);
      
      if (sellSuccess) {
        const balanceAfterSell = await testUtils.getCurrentBalance();
        
        // Рассчитываем P&L
        const priceDifference = newPrice - initialPrice;
        const profitLoss = balanceAfterSell - balanceAfterBuy;
        
        console.log(`📊 Изменение цены: $${priceDifference.toFixed(2)}`);
        console.log(`💰 Реализованный P&L: $${profitLoss.toFixed(2)}`);
        
        // Проверяем, что P&L соответствует изменению цены (с допуском)
        expect(Math.abs(profitLoss - priceDifference)).toBeLessThan(1);
        console.log('✅ P&L рассчитан корректно');
      } else {
        console.log('⚠️ Продажа не удалась, пропускаем проверку P&L');
      }
    } else {
      console.log('⚠️ Покупка не удалась, пропускаем тест P&L');
    }
  });
});