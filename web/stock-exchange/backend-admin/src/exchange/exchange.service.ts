import { Injectable, NotFoundException } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { StocksDataService } from '../data/stocks-data.service';

@Injectable()
export class StocksService {
    constructor(
        private readonly dataService: DataService,
        private readonly stocksDataService: StocksDataService
    ) {}

    async getAllStocks() {
        // Всегда берем акции из stocks-data.json
        const stocks = await this.stocksDataService.loadStocksData();

        // Загружаем текущие настройки активации из data.json
        const data = await this.dataService.loadData();

        // Объединяем: базовые данные из stocks-data.json с настройками из data.json
        return stocks.map(stock => {
            const savedStock = data.stocks?.find(s => s.symbol === stock.symbol);
            return {
                symbol: stock.symbol,
                companyName: stock.companyName,
                description: stock.description,
                sector: stock.sector,
                isActive: savedStock?.isActive ?? stock.isActive,
                price: savedStock?.price ?? stock.price,
                change: savedStock?.change ?? stock.change,
                changePercent: savedStock?.changePercent ?? stock.changePercent
            };
        });
    }

    async getStock(symbol: string) {
        const stocks = await this.getAllStocks();
        const stock = stocks.find(s => s.symbol === symbol);

        if (!stock) {
            throw new NotFoundException(`Акция ${symbol} не найдена`);
        }

        return stock;
    }

    async getStockHistory(symbol: string) {
        return this.stocksDataService.loadStockHistory(symbol);
    }

    async toggleStock(symbol: string, isActive: boolean) {
        const data = await this.dataService.loadData();

        // Инициализируем массив stocks если его нет
        if (!data.stocks) {
            data.stocks = [];
        }

        const stockIndex = data.stocks.findIndex(s => s.symbol === symbol);

        if (stockIndex === -1) {
            // Добавляем новую запись с настройками активации
            data.stocks.push({
                symbol,
                isActive,
                price: 100, // Базовое значение, будет обновлено при торговле
                change: 0,
                changePercent: 0
            });
        } else {
            // Обновляем существующую запись
            data.stocks[stockIndex].isActive = isActive;
        }

        await this.dataService.saveData(data);

        return {
            message: `Акция ${symbol} ${isActive ? 'активирована' : 'деактивирована'}`,
            stock: await this.getStock(symbol)
        };
    }

    async initializeStocksForTrading() {
        const stocks = await this.stocksDataService.loadStocksData();
        const data = await this.dataService.loadData();

        // Инициализируем акции в data.json если их нет
        if (!data.stocks || data.stocks.length === 0) {
            data.stocks = stocks.map(stock => ({
                symbol: stock.symbol,
                isActive: stock.isActive,
                price: stock.price,
                change: stock.change,
                changePercent: stock.changePercent
            }));
            await this.dataService.saveData(data);
        }

        return data.stocks;
    }
}