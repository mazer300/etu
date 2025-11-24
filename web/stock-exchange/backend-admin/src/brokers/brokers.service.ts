import { Injectable, NotFoundException } from '@nestjs/common';
import { DataService } from '../data/data.service';

@Injectable()
export class BrokersService {
    constructor(private readonly dataService: DataService) {}

    async getAllBrokers() {
        const data = await this.dataService.loadData();
        return data.brokers;
    }

    async getBroker(id: number) {
        const data = await this.dataService.loadData();
        const broker = data.brokers.find(b => b.id === id);

        if (!broker) {
            throw new NotFoundException(`Брокер с ID ${id} не найден`);
        }

        return broker;
    }

    async createBroker(createBrokerDto: any) {
        const data = await this.dataService.loadData();

        // СОХРАНЯЕМ ВСЕ ДАННЫЕ ПЕРЕД ОБНОВЛЕНИЕМ
        const stocksSettings = data.stocks ? [...data.stocks] : [];
        const exchangeConfig = data.exchangeConfig ? { ...data.exchangeConfig } : {};

        const newBroker = {
            id: Date.now(),
            name: createBrokerDto.name.trim(),
            initialBalance: parseFloat(createBrokerDto.initialBalance),
            currentBalance: parseFloat(createBrokerDto.initialBalance),
            createdAt: new Date().toISOString(),
            portfolio: {},
        };

        data.brokers.push(newBroker);

        // ВОССТАНАВЛИВАЕМ ВСЕ ДАННЫЕ ПЕРЕД СОХРАНЕНИЕМ
        data.stocks = stocksSettings; // Все настройки акций сохраняются
        data.exchangeConfig = exchangeConfig; // Конфигурация биржи сохраняется

        await this.dataService.saveData(data);

        return newBroker;
    }

    async updateBroker(id: number, updateBrokerDto: any) {
        const data = await this.dataService.loadData();
        const brokerIndex = data.brokers.findIndex(b => b.id === id);

        if (brokerIndex === -1) {
            throw new NotFoundException(`Брокер с ID ${id} не найден`);
        }

        // СОХРАНЯЕМ ВСЕ ДАННЫЕ ПЕРЕД ОБНОВЛЕНИЕМ
        const stocksSettings = data.stocks ? [...data.stocks] : [];
        const exchangeConfig = data.exchangeConfig ? { ...data.exchangeConfig } : {};

        const balanceDifference = parseFloat(updateBrokerDto.initialBalance) - data.brokers[brokerIndex].initialBalance;

        data.brokers[brokerIndex] = {
            ...data.brokers[brokerIndex],
            name: updateBrokerDto.name.trim(),
            initialBalance: parseFloat(updateBrokerDto.initialBalance),
            currentBalance: data.brokers[brokerIndex].currentBalance + balanceDifference,
            portfolio: updateBrokerDto.portfolio || data.brokers[brokerIndex].portfolio,
        };

        // ВОССТАНАВЛИВАЕМ ВСЕ ДАННЫЕ ПЕРЕД СОХРАНЕНИЕМ
        data.stocks = stocksSettings; // Все настройки акций сохраняются
        data.exchangeConfig = exchangeConfig; // Конфигурация биржи сохраняется

        await this.dataService.saveData(data);
        return data.brokers[brokerIndex];
    }

    async deleteBroker(id: number) {
        const data = await this.dataService.loadData();
        const brokerIndex = data.brokers.findIndex(b => b.id === id);

        if (brokerIndex === -1) {
            throw new NotFoundException(`Брокер с ID ${id} не найден`);
        }

        // СОХРАНЯЕМ ВСЕ ДАННЫЕ ПЕРЕД ОБНОВЛЕНИЕМ
        const stocksSettings = data.stocks ? [...data.stocks] : [];
        const exchangeConfig = data.exchangeConfig ? { ...data.exchangeConfig } : {};

        data.brokers.splice(brokerIndex, 1);

        // ВОССТАНАВЛИВАЕМ ВСЕ ДАННЫЕ ПЕРЕД СОХРАНЕНИЕМ
        data.stocks = stocksSettings; // Все настройки акций сохраняются
        data.exchangeConfig = exchangeConfig; // Конфигурация биржи сохраняется

        await this.dataService.saveData(data);
    }
}