const fs = require('fs').promises;
const path = require('path');

async function convertAllCsvToJson() {
  try {
    const csvDir = path.join(__dirname, 'csv-data');
    const stocksDir = path.join(__dirname, 'data', 'stocks');
    
    // Создаем папки если не существуют
    await fs.mkdir(csvDir, { recursive: true });
    await fs.mkdir(stocksDir, { recursive: true });
    
    // Получаем все CSV файлы
    const files = await fs.readdir(csvDir);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    
    console.log(`📁 Найдено CSV файлов: ${csvFiles.length}`);
    
    for (const csvFile of csvFiles) {
      await convertSingleCsv(csvFile, csvDir, stocksDir);
    }
    
    console.log('🎉 Все CSV файлы сконвертированы в JSON!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

async function convertSingleCsv(csvFile, csvDir, stocksDir) {
  try {
    const symbol = csvFile.replace('.csv', '').toUpperCase();
    const csvPath = path.join(csvDir, csvFile);
    const jsonPath = path.join(stocksDir, `${symbol.toLowerCase()}.json`);
    
    console.log(`\n📊 Конвертируем ${symbol}...`);
    
    // Читаем CSV файл
    const csvData = await fs.readFile(csvPath, 'utf8');
    const lines = csvData.trim().split('\n');
    
    // Парсим заголовки
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Создаем массив для данных в нужном формате
    const history = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      const entry = {};
      
      // Заполняем данные по заголовкам
      headers.forEach((header, index) => {
        let value = values[index] || '';
        entry[header] = value;
      });
      
      // Форматируем в нужный формат
      const formattedEntry = {
        date: entry.Date,
        open: entry.Open
      };
      
      history.push(formattedEntry);
    }
    
    // Реверсируем чтобы старые данные были первыми
    history.reverse();
    
    // Сохраняем JSON
    await fs.writeFile(jsonPath, JSON.stringify(history, null, 2));
    
    console.log(`✅ ${symbol}: ${history.length} записей → ${jsonPath}`);
    
  } catch (error) {
    console.error(`❌ Ошибка конвертации ${csvFile}:`, error);
  }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  convertAllCsvToJson();
}