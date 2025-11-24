// Увеличиваем таймаут для тестов
jest.setTimeout(60000);

// Настройка Puppeteer
beforeAll(async () => {
  // Убедимся, что страница загружена
  await page.setDefaultTimeout(30000);
  await page.setViewport({ width: 1280, height: 720 });
  
  // Игнорируем ошибки SSL и другие
  await page.setBypassCSP(true);
  
  // Логируем начало тестов
  console.log('🧪 Начинаем выполнение тестов...');
});

afterAll(async () => {
  console.log('✅ Все тесты завершены');
});

// Глобальные функции для отладки
global.takeScreenshot = async (name) => {
  const path = `./screenshots/${name || 'debug'}-${Date.now()}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Снимок сохранен: ${path}`);
};

global.pause = async (ms = 5000) => {
  console.log(`⏸️ Пауза на ${ms}ms для отладки...`);
  await page.waitForTimeout(ms);
};

// Функция для логирования
global.log = (message) => {
  console.log(`📝 ${message}`);
};