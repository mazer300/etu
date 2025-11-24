import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { DataService } from '../data/data.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { StocksService } from '../stocks/stocks.service';
import { StocksDataService } from '../data/stocks-data.service';

@Module({
    controllers: [ExchangeController],
    providers: [
        DataService,
        WebsocketGateway,
        StocksService,
        StocksDataService
    ],
})
export class ExchangeModule {}