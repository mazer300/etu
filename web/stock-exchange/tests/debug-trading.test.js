const TradingTestUtils = require('./trading-test-utils');

describe('Отладочные тесты торговли', () => {
  let testUtils;

  beforeAll(async () => {
    testUtils = new TradingTestUtils(page);
    await page.goto('http://localhost:3012');
    await testUtils.waitForTradingPage();
  });

  test('Отладочная информация о странице', async () => {
    console.log('🔍 Собираем отладочную информацию...');
    
    // Получаем весь HTML страницы
    const html = await page.content();
    console.log('📄 Длина HTML:', html.length);
    
    // Ищем все кнопки на странице
    const allButtons = await page.$$('button, input[type="button"], input[type="submit"]');
    console.log(`🎯 Всего кнопок на странице: ${allButtons.length}`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await page.evaluate(el => el.textContent || el.value || el.innerHTML, button);
      console.log(`🔘 Кнопка ${i}: "${text.trim()}"`);
    }
    
    // Ищем все поля ввода
    const allInputs = await page.$$('input, textarea');
    console.log(`⌨️ Всего полей ввода: ${allInputs.length}`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const type = await page.evaluate(el => el.type, input);
      const placeholder = await page.evaluate(el => el.placeholder, input);
      console.log(`📝 Поле ${i}: type="${type}", placeholder="${placeholder}"`);
    }
    
    // Делаем скриншот
    await page.screenshot({ path: './screenshots/debug-full-page.png', fullPage: true });
    console.log('📸 Скриншот сохранен: ./screenshots/debug-full-page.png');
  });

  test('Тест реальной покупки акции', async () => {
    console.log('🧪 Тестируем реальную покупку...');
    
    // Ищем акции
    const stocks = await page.$$('[class*="stock"], .card, [class*="card"], .stock-item');
    console.log(`📈 Найдено элементов акций: ${stocks.length}`);
    
    if (stocks.length === 0) {
      console.log('❌ Акции не найдены');
      return;
    }
    
    // Берем первую акцию
    const stockElement = stocks[0];
    const stockText = await page.evaluate(el => el.textContent, stockElement);
    console.log(`🎯 Акция для теста: ${stockText.substring(0, 200)}...`);
    
    // Получаем начальный баланс
    const initialBalance = await testUtils.getCurrentBalance();
    console.log(`💰 Начальный баланс: $${initialBalance}`);
    
    // Ищем поле количества внутри элемента акции
    const quantityInput = await stockElement.$('input[type="number"]');
    if (quantityInput) {
      console.log('✅ Найдено поле ввода количества в элементе акции');
      await quantityInput.click({ clickCount: 3 });
      await quantityInput.type('1');
    } else {
      console.log('❌ Поле ввода не найдено в элементе акции');
    }
    
    // Ищем кнопку покупки внутри элемента акции
    const buyButton = await stockElement.$('button');
    if (buyButton) {
      const buttonText = await page.evaluate(el => el.textContent, buyButton);
      console.log(`🛒 Найдена кнопка: "${buttonText}"`);
      
      // Кликаем на кнопку покупки
      await buyButton.click();
      console.log('✅ Клик на кнопку выполнен');
      
      // Ждем обновления баланса
      await page.waitForTimeout(5000);
      
      // Проверяем баланс
      const newBalance = await testUtils.getCurrentBalance();
      console.log(`💰 Баланс после покупки: $${newBalance}`);
      
      if (newBalance !== initialBalance) {
        console.log('✅ Баланс изменился!');
      } else {
        console.log('❌ Баланс не изменился');
      }
    } else {
      console.log('❌ Кнопка не найдена в элементе акции');
    }
  });
});