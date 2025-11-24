import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Сервис для работы с основными данными приложения
 * Чтение/запись в data.json (брокеры, настройки биржи, состояние акций)
 */
@Injectable()
export class DataService {
    // Пути к файлам данных внутри Docker контейнера
    private readonly dataPath = path.join('/app/data', 'data.json');
    private readonly stocksDir = path.join('/app/data', 'stocks');

    /**
     * Загружает основные данные приложения из data.json
     * Если файл не существует, создает данные по умолчанию
     */
    async loadData() {
        try {
            console.log('Loading data from:', this.dataPath);

            // Проверяем существование файла
            try {
                await fs.access(this.dataPath);
            } catch {
                console.log('Data file does not exist, creating default...');
                return await this.createDefaultData();
            }

            // Читаем и парсим данные из файла
            const data = await fs.readFile(this.dataPath, 'utf8');
            const parsedData = JSON.parse(data);
            console.log('Data loaded successfully');
            return parsedData;
        } catch (error) {
            console.error('Error loading data, creating default:', error);
            return await this.createDefaultData();
        }
    }

    /**
     * Сохраняет данные в data.json
     * @param data - объект данных для сохранения
     */
    async saveData(data: any) {
        try {
            // Создаем директорию если не существует
            await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
            // Записываем данные с красивым форматированием
            await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
            console.log('Data saved successfully to:', this.dataPath);
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            throw error;
        }
    }

    /**
     * Создает структуру данных по умолчанию при первом запуске
     */
    private async createDefaultData() {
        console.log('Creating default data structure...');
        const defaultData = {
            brokers: [
                {
                    id: 1,
                    name: "Иван Петров",
                    initialBalance: 100000,
                    currentBalance: 100000,
                    createdAt: new Date().toISOString(),
                    portfolio: {}
                },
                {
                    id: 2,
                    name: "АО 'Инвест'",
                    initialBalance: 500000,
                    currentBalance: 500000,
                    createdAt: new Date().toISOString(),
                    portfolio: {}
                }
            ],
            stocks: [], // Акции будут заполнены из stocks-data.json
            exchangeConfig: {
                startDate: null,
                speed: 1,
                isTrading: false,
                currentDateIndex: 0,
                currentDate: null
            }
        };

        await this.saveData(defaultData);
        return defaultData;
    }

    /**
     * Загружает исторические данные для конкретной акции
     * @param symbol - символ акции (AAPL, MSFT, etc.)
     */
    async loadStockHistory(symbol: string) {
        try {
            const historyPath = path.join(this.stocksDir, `${symbol.toLowerCase()}.json`);
            console.log('Loading stock history from:', historyPath);

            const historyData = await fs.readFile(historyPath, 'utf8');
            const rawData = JSON.parse(historyData);

            // Преобразуем данные: парсим цены из строк в числа
            return rawData.map((item: any) => ({
                date: item.date,
                price: this.parsePrice(item.open),
                open: this.parsePrice(item.open)
            }));
        } catch (error) {
            console.error(`Error loading history for ${symbol}:`, error);
            return this.getSampleHistory();
        }
    }

    /**
     * Возвращает пример исторических данных если файл не найден
     */
    private getSampleHistory() {
        return [
            { date: "01/01/2023", open: 100.00, price: 100.00 },
            { date: "01/02/2023", open: 101.50, price: 101.50 },
            { date: "01/03/2023", open: 102.25, price: 102.25 },
            { date: "01/04/2023", open: 101.75, price: 101.75 },
            { date: "01/05/2023", open: 103.00, price: 103.00 }
        ];
    }

    /**
     * Парсит строку цены в число
     * Убирает символы $ и запятые, преобразует в float
     * @param priceStr - строка цены ("$150.25")
     */
    private parsePrice(priceStr: string | number): number {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        return parseFloat(priceStr.toString().replace('$', '').replace(',', ''));
    }
}