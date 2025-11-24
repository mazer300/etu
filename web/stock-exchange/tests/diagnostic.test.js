describe('Диагностика системы', () => {
  test('Проверка загрузки страницы биржи', async () => {
    console.log('🌐 Переходим на http://localhost:3012...');
    await page.goto('http://localhost:3012', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Ждем немного
    await page.waitForTimeout(5000);
    
    // Получаем заголовок страницы
    const title = await page.title();
    console.log(`📄 Заголовок страницы: "${title}"`);
    
    // Получаем URL
    const currentUrl = page.url();
    console.log(`🔗 Текущий URL: ${currentUrl}`);
    
    // Получаем содержимое страницы
    const content = await page.content();
    console.log(`📏 Длина контента: ${content.length} символов`);
    
    // Проверяем ключевые слова в контенте
    if (content.includes('Торговая площадка')) {
      console.log('✅ Найдена "Торговая площадка"');
    } else {
      console.log('❌ Не найдена "Торговая площадка"');
    }
    
    if (content.includes('trading-page')) {
      console.log('✅ Найдено "trading-page"');
    } else {
      console.log('❌ Не найдено "trading-page"');
    }
    
    // Ищем все классы на странице
    const classes = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const classList = new Set();
      elements.forEach(el => {
        if (el.className) {
          el.className.split(' ').forEach(className => classList.add(className));
        }
      });
      return Array.from(classList);
    });
    
    console.log('🎯 Найденные классы:', classes.filter(cls => 
      cls.includes('trading') || cls.includes('stock') || cls.includes('portfolio') || cls.includes('broker')
    ));
    
    // Делаем скриншот
    await page.screenshot({ path: './screenshots/diagnostic.png', fullPage: true });
    console.log('📸 Скриншот сохранен: ./screenshots/diagnostic.png');
    
    // Проверяем наличие элементов по разным возможным селекторам
    const possibleSelectors = [
      '.trading-page',
      '.trading',
      '[class*="trading"]',
      '.stock-card',
      '.stock',
      '[class*="stock"]',
      '.broker-info',
      '.broker',
      '[class*="broker"]',
      '.portfolio',
      '[class*="portfolio"]',
      'h1',
      'h2'
    ];
    
    for (const selector of possibleSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ Найден элемент: ${selector}`);
        const text = await page.evaluate(el => el.textContent?.substring(0, 100), element);
        console.log(`   Текст: "${text}..."`);
      }
    }
  });
});