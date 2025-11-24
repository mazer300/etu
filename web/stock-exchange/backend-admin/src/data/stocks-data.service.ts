import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Сервис для работы с данными акций
 * Загружает базовую информацию об акциях из stocks-data.json
 * и исторические данные из папки stocks/
 */
@Injectable()
export class StocksDataService {
    // Пути к файлам данных внутри Docker контейнера
    private readonly stocksDataPath = path.join('/app/data', 'stocks-data.json');
    private readonly stocksDir = path.join('/app/data', 'stocks');

    /**
     * Загружает базовые данные об акциях из stocks-data.json
     * Если файл не существует, создает данные по умолчанию
     * @returns Promise с массивом акций
     */
    async loadStocksData() {
        try {
            console.log('Loading stocks data from:', this.stocksDataPath);

            // Проверяем существование файла
            try {
                await fs.access(this.stocksDataPath);
            } catch {
                console.log('Stocks data file does not exist, creating default...');
                return await this.createDefaultStocksData();
            }

            // Читаем и парсим данные из файла
            const data = await fs.readFile(this.stocksDataPath, 'utf8');
            const parsedData = JSON.parse(data);
            console.log('Stocks data loaded successfully');
            return parsedData.stocks || [];
        } catch (error) {
            console.error('Error loading stocks data, creating default:', error);
            return await this.createDefaultStocksData();
        }
    }

    /**
     * Загружает исторические данные для конкретной акции
     * Использует реальные данные из NASDAQ в формате JSON
     * @param symbol - символ акции (AAPL, MSFT, etc.)
     * @returns Promise с массивом исторических данных
     */
    async loadStockHistory(symbol: string) {
        try {
            const historyPath = path.join(this.stocksDir, `${symbol.toLowerCase()}.json`);
            console.log('Loading stock history from:', historyPath);

            const historyData = await fs.readFile(historyPath, 'utf8');
            const rawData = JSON.parse(historyData);

            // Преобразуем все данные, не ограничивая количество
            // Формат данных соответствует требованиям: дата и цена открытия
            const history = rawData.map((item: any) => ({
                date: item.date,                    // Дата в формате "ММ/ДД/ГГГГ"
                price: this.parsePrice(item.open), // Цена открытия (основная цена)
                open: this.parsePrice(item.open),  // Цена открытия (дублирование для удобства)
                high: this.parsePrice(item.high),  // Максимальная цена дня (опционально)
                low: this.parsePrice(item.low),    // Минимальная цена дня (опционально)
                close: this.parsePrice(item.close),// Цена закрытия (опционально)
                volume: item.volume                // Объем торгов (опционально)
            }));

            console.log(`📊 Loaded ${history.length} days of history for ${symbol}`);
            return history;
        } catch (error) {
            console.error(`Error loading history for ${symbol}:`, error);
            return this.getSampleHistory();
        }
    }

    /**
     * Создает структуру данных по умолчанию при первом запуске
     * Содержит все 8 требуемых компаний с базовой информацией
     */
    private async createDefaultStocksData() {
        console.log('Creating default stocks data structure...');
        const defaultStocks = [
            {
                symbol: "AAPL",
                companyName: "Apple, Inc.",
                description: "Американская корпорация",
                sector: "Technology",
                isActive: true,
                price: 150.25,
                change: 1.25,
                changePercent: 0.84
            },
            {
                symbol: "MSFT",
                companyName: "Microsoft, Inc.",
                description: "Американская технологическая компания",
                sector: "Technology",
                isActive: true,
                price: 335.15,
                change: -2.35,
                changePercent: -0.70
            },
            {
                symbol: "SBUX",
                companyName: "Starbucks, Inc.",
                description: "Американская компания, крупнейшая в мире сеть кофеен",
                sector: "Consumer Discretionary",
                isActive: true,
                price: 95.40,
                change: 0.65,
                changePercent: 0.68
            },
            {
                symbol: "CSCO",
                companyName: "Cisco Systems, Inc.",
                description: "Американская транснациональная компания",
                sector: "Technology",
                isActive: true,
                price: 52.80,
                change: -0.30,
                changePercent: -0.57
            },
            {
                symbol: "QCOM",
                companyName: "QUALCOMM Incorporated",
                description: "Американская компания, разработчик полупроводников",
                sector: "Technology",
                isActive: true,
                price: 128.75,
                change: 1.20,
                changePercent: 0.94
            },
            {
                symbol: "AMZN",
                companyName: "Amazon.com, Inc.",
                description: "Американская компания, крупнейшая в мире по обороту интернет-ритейла",
                sector: "Consumer Discretionary",
                isActive: true,
                price: 145.60,
                change: 2.15,
                changePercent: 1.50
            },
            {
                symbol: "TSLA",
                companyName: "Tesla, Inc.",
                description: "Американская компания, производитель электромобилей",
                sector: "Consumer Discretionary",
                isActive: true,
                price: 210.30,
                change: -5.20,
                changePercent: -2.41
            },
            {
                symbol: "AMD",
                companyName: "Advanced Micro Devices, Inc.",
                description: "Американская компания, производитель полупроводниковой продукции",
                sector: "Technology",
                isActive: true,
                price: 112.45,
                change: 3.15,
                changePercent: 2.88
            }
        ];

        const defaultData = { stocks: defaultStocks };
        await fs.mkdir(path.dirname(this.stocksDataPath), { recursive: true });
        await fs.writeFile(this.stocksDataPath, JSON.stringify(defaultData, null, 2));

        return defaultStocks;
    }

    /**
     * Генерирует пример исторических данных если файлы не найдены
     * Создает 365 дней торговых данных с 2023 года
     */
    private getSampleHistory() {
        const sampleData = [];
        const startDate = new Date('2023-01-01');

        // Генерируем данные на год вперед
        for (let i = 0; i < 365; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            // Пропускаем выходные (суббота и воскресенье)
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                const price = 100 + (Math.random() * 100); // Случайная цена от 100 до 200
                sampleData.push({
                    date: this.formatDateMMDDYYYY(date),
                    open: price,
                    price: price,
                    high: price + Math.random() * 5,
                    low: price - Math.random() * 5,
                    close: price,
                    volume: Math.floor(Math.random() * 1000000)
                });
            }
        }

        return sampleData;
    }

    /**
     * Форматирует Date объект в строку ММ/ДД/ГГГГ
     * @param date - объект Date для форматирования
     */
    private formatDateMMDDYYYY(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    /**
     * Парсит строку цены в число
     * Обрабатывает форматы: "$150.25", "150.25", 150.25
     * @param priceStr - строка или число для парсинга
     */
    private parsePrice(priceStr: string | number): number {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        return parseFloat(priceStr.toString().replace('$', '').replace(',', ''));
    }
}