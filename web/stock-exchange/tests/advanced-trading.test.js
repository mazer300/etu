const TradingTestUtils = require('./trading-test-utils')

describe('Продвинутые сценарии торговли', () => {
  let testUtils

  beforeAll(async () => {
    testUtils = new TradingTestUtils(page)
    await page.goto('http://localhost:3012')
    await testUtils.waitForTradingPage()
  })

  test('Комплексный сценарий: покупка, ожидание изменения цены, продажа', async () => {
    const symbol = 'AAPL'
    const quantity = 1
    
    // Шаг 1: Покупаем акции
    const initialBalance = await testUtils.getCurrentBalance()
    const stockElement = await testUtils.findStockBySymbol(symbol)
    const purchasePrice = await testUtils.getStockPrice(stockElement)
    
    console.log(`🛒 Покупаем ${quantity} акций ${symbol} по $${purchasePrice}`)
    await testUtils.buyStock(stockElement, quantity)
    
    // Проверяем покупку
    const afterPurchaseBalance = await testUtils.getCurrentBalance()
    expect(afterPurchaseBalance).toBeLessThan(initialBalance)
    
    const position = await testUtils.getPortfolioPosition(symbol)
    expect(position.quantity).toBe(quantity)
    console.log(`📊 Позиция создана: ${position.quantity} шт. по $${position.averagePrice}`)
    
    // Шаг 2: Ждем изменения цены
    console.log('⏳ Ожидаем изменения цены...')
    await page.waitForTimeout(10000)
    
    // Шаг 3: Проверяем обновленный P&L
    const updatedPosition = await testUtils.getPortfolioPosition(symbol)
    const currentPrice = await testUtils.getStockPrice(stockElement)
    
    // Рассчитываем ожидаемый P&L
    const expectedPnl = ((currentPrice - purchasePrice) / purchasePrice) * 100
    console.log(`📈 P&L: ${updatedPosition.pnl}% (ожидалось: ${expectedPnl.toFixed(2)}%)`)
    
    // Шаг 4: Продаем акции
    console.log(`💰 Продаем ${quantity} акций ${symbol} по $${currentPrice}`)
    await testUtils.sellStock(stockElement, quantity)
    
    // Проверяем продажу
    const afterSaleBalance = await testUtils.getCurrentBalance()
    const finalPosition = await testUtils.getPortfolioPosition(symbol)
    
    expect(finalPosition).toBeNull() // Позиция должна удалиться
    expect(afterSaleBalance).toBeGreaterThan(afterPurchaseBalance)
    console.log(`✅ Сделка завершена. Итоговый баланс: $${afterSaleBalance}`)
  })

  test('Тест торговли несколькими разными акциями', async () => {
    const trades = [
      { symbol: 'GOOGL', quantity: 1 },
      { symbol: 'MSFT', quantity: 1 }
    ]
    
    const initialBalance = await testUtils.getCurrentBalance()
    let totalCost = 0
    
    console.log('🛒 Начинаем покупку нескольких акций...')
    
    // Покупаем несколько акций
    for (const trade of trades) {
      const stockElement = await testUtils.findStockBySymbol(trade.symbol)
      const price = await testUtils.getStockPrice(stockElement)
      totalCost += price * trade.quantity
      
      console.log(`📥 Покупаем ${trade.quantity} акций ${trade.symbol} по $${price}`)
      await testUtils.buyStock(stockElement, trade.quantity)
      await page.waitForTimeout(1000)
    }
    
    // Проверяем общий баланс
    const afterTradingBalance = await testUtils.getCurrentBalance()
    const expectedBalance = initialBalance - totalCost
    
    console.log(`💰 Баланс: было $${initialBalance}, стало $${afterTradingBalance}, ожидалось: $${expectedBalance}`)
    expect(afterTradingBalance).toBeCloseTo(expectedBalance, 2)
    
    // Проверяем все позиции в портфеле
    for (const trade of trades) {
      const position = await testUtils.getPortfolioPosition(trade.symbol)
      expect(position.quantity).toBe(trade.quantity)
      console.log(`✅ Позиция ${trade.symbol}: ${position.quantity} шт.`)
    }
  })
})