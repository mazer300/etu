const TradingTestUtils = require('./trading-test-utils')

describe('Торговая площадка - Основные сценарии', () => {
  let testUtils

  beforeAll(async () => {
    testUtils = new TradingTestUtils(page)
    
    // Переходим на страницу торговой площадки
    console.log('🌐 Переходим на страницу биржи...')
    await page.goto('http://localhost:3012')
    await testUtils.waitForTradingPage()
  })

  beforeEach(async () => {
    // Обновляем страницу перед каждым тестом для чистого состояния
    await page.reload()
    await testUtils.waitForTradingPage()
  })

  describe('Проверка начального состояния', () => {
    test('Страница торговой площадки загружается корректно', async () => {
      // Проверяем основные элементы интерфейса
      await expect(page).toMatchElement('.trading-header h1', { text: /Торговая площадка/i })
      await expect(page).toMatchElement('.broker-info')
      await expect(page).toMatchElement('.stocks-grid')
      await expect(page).toMatchElement('.portfolio-section')
    })

    test('Отображается корректный начальный баланс', async () => {
      const initialBalance = await testUtils.getCurrentBalance()
      expect(initialBalance).toBeGreaterThan(0)
      expect(initialBalance).toBeLessThanOrEqual(100000) // Предполагаемый максимальный начальный баланс
    })

    test('Список акций загружается и отображается', async () => {
      const stockCards = await page.$$('.stock-card')
      expect(stockCards.length).toBeGreaterThan(0)
    })
  })

  describe('Тесты покупки акций', () => {
    test('Покупка акций уменьшает баланс на корректную сумму', async () => {
      const symbol = 'AAPL'
      const quantity = 2
      
      // Получаем начальный баланс
      const initialBalance = await testUtils.getCurrentBalance()
      console.log(`💰 Начальный баланс: $${initialBalance}`)
      
      // Находим акцию и получаем её цену
      const stockElement = await testUtils.findStockBySymbol(symbol)
      expect(stockElement).not.toBeNull()
      
      const stockPrice = await testUtils.getStockPrice(stockElement)
      const expectedCost = stockPrice * quantity
      console.log(`💵 Цена акции ${symbol}: $${stockPrice}, ожидаемая стоимость: $${expectedCost}`)
      
      // Покупаем акции
      const purchaseSuccessful = await testUtils.buyStock(stockElement, quantity)
      expect(purchaseSuccessful).toBe(true)
      
      // Проверяем изменение баланса
      const newBalance = await testUtils.getCurrentBalance()
      const balanceDifference = initialBalance - newBalance
      
      console.log(`💰 Новый баланс: $${newBalance}, разница: $${balanceDifference}`)
      expect(balanceDifference).toBeCloseTo(expectedCost, 2)
    })

    test('Покупка акций добавляет позицию в портфель', async () => {
      const symbol = 'GOOGL'
      const quantity = 1
      
      // Покупаем акции
      const stockElement = await testUtils.findStockBySymbol(symbol)
      await testUtils.buyStock(stockElement, quantity)
      
      // Проверяем появление позиции в портфеле
      await page.waitForTimeout(2000)
      const position = await testUtils.getPortfolioPosition(symbol)
      
      expect(position).not.toBeNull()
      expect(position.quantity).toBe(quantity)
      expect(position.averagePrice).toBeGreaterThan(0)
      console.log(`📊 Позиция ${symbol}: ${position.quantity} шт. по $${position.averagePrice}`)
    })

    test('Невозможно купить акции при недостаточном балансе', async () => {
      const symbol = 'TSLA'
      
      // Получаем текущий баланс и цену акции
      const balance = await testUtils.getCurrentBalance()
      const stockElement = await testUtils.findStockBySymbol(symbol)
      const stockPrice = await testUtils.getStockPrice(stockElement)
      
      // Пытаемся купить больше акций, чем можем себе позволить
      const excessiveQuantity = Math.ceil(balance / stockPrice) + 10
      
      // Устанавливаем количество
      await testUtils.setTradeQuantity(stockElement, excessiveQuantity)
      
      // Проверяем, что кнопка покупки заблокирована
      const buyButton = await stockElement.$('.buy-btn[disabled]')
      expect(buyButton).not.toBeNull()
      console.log(`🚫 Покупка заблокирована при попытке купить ${excessiveQuantity} акций`)
    })
  })

  describe('Тесты продажи акций', () => {
    beforeEach(async () => {
      // Перед тестами продажи покупаем немного акций
      const symbol = 'MSFT'
      const quantity = 1
      
      const stockElement = await testUtils.findStockBySymbol(symbol)
      await testUtils.buyStock(stockElement, quantity)
      
      // Ждем обновления портфеля
      await page.waitForTimeout(2000)
    })

    test('Продажа акций увеличивает баланс на корректную сумму', async () => {
      const symbol = 'MSFT'
      const quantity = 1
      
      // Получаем начальный баланс и текущую цену
      const initialBalance = await testUtils.getCurrentBalance()
      const stockElement = await testUtils.findStockBySymbol(symbol)
      const currentPrice = await testUtils.getStockPrice(stockElement)
      const expectedRevenue = currentPrice * quantity
      
      console.log(`💰 Баланс до продажи: $${initialBalance}, ожидаемый доход: $${expectedRevenue}`)
      
      // Продаем акции
      const sellSuccessful = await testUtils.sellStock(stockElement, quantity)
      expect(sellSuccessful).toBe(true)
      
      // Проверяем изменение баланса
      const newBalance = await testUtils.getCurrentBalance()
      const balanceDifference = newBalance - initialBalance
      
      console.log(`💰 Баланс после продажи: $${newBalance}, разница: $${balanceDifference}`)
      expect(balanceDifference).toBeCloseTo(expectedRevenue, 2)
    })

    test('Продажа всех акций удаляет позицию из портфеля', async () => {
      const symbol = 'MSFT'
      
      // Получаем текущее количество
      const position = await testUtils.getPortfolioPosition(symbol)
      expect(position).not.toBeNull()
      
      const initialQuantity = position.quantity
      console.log(`📊 Начальная позиция: ${initialQuantity} шт.`)
      
      // Продаем все акции
      const stockElement = await testUtils.findStockBySymbol(symbol)
      await testUtils.sellStock(stockElement, initialQuantity)
      
      // Ждем обновления портфеля
      await page.waitForTimeout(2000)
      
      // Проверяем, что позиция удалилась из портфеля
      const newPosition = await testUtils.getPortfolioPosition(symbol)
      expect(newPosition).toBeNull()
      console.log('✅ Позиция удалена из портфеля')
    })

    test('Невозможно продать больше акций, чем есть в портфеле', async () => {
      const symbol = 'MSFT'
      
      // Получаем текущее количество
      const position = await testUtils.getPortfolioPosition(symbol)
      const currentQuantity = position.quantity
      
      const stockElement = await testUtils.findStockBySymbol(symbol)
      
      // Пытаемся продать больше, чем есть
      await testUtils.setTradeQuantity(stockElement, currentQuantity + 5)
      
      // Проверяем, что кнопка продажи заблокирована
      const sellButton = await stockElement.$('.sell-btn[disabled]')
      expect(sellButton).not.toBeNull()
      console.log(`🚫 Продажа заблокирована при попытке продать ${currentQuantity + 5} из ${currentQuantity} акций`)
    })
  })
})