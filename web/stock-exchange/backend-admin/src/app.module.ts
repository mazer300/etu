import { Module } from '@nestjs/common';
import { BrokersController } from './brokers/brokers.controller';
import { ExchangeController } from './exchange/exchange.controller';
import { HealthController } from './health/health.controller';
import { StocksController } from './stocks/stocks.controller';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { DataService } from './data/data.service';
import { StocksDataService } from './data/stocks-data.service';
import { BrokersService } from './brokers/brokers.service';
import { StocksService } from './stocks/stocks.service';

/**
 * Главный модуль приложения NestJS
 * Регистрирует все контроллеры, сервисы и провайдеры
 */
@Module({
    imports: [], // Импорты других модулей (пока не используются)
    controllers: [
        BrokersController,    // Контроллер для работы с брокерами
        ExchangeController,   // Контроллер для настроек биржи
        HealthController,     // Контроллер для health-check
        StocksController      // Контроллер для работы с акциями
    ],
    providers: [
        DataService,          // Сервис для работы с данными (data.json)
        StocksDataService,    // Сервис для работы с данными акций (stocks-data.json)
        WebsocketGateway,     // WebSocket шлюз для реального времени
        BrokersService,       // Сервис бизнес-логики для брокеров
        StocksService         // Сервис бизнес-логики для акций
    ],
})
export class AppModule {}