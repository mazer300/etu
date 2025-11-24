import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('api/stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) {}

    @Get()
    async getAllStocks() {
        return this.stocksService.getAllStocks();
    }

    @Get(':symbol')
    async getStock(@Param('symbol') symbol: string) {
        return this.stocksService.getStock(symbol);
    }

    @Put(':symbol/toggle')
    async toggleStock(@Param('symbol') symbol: string, @Body() body: any) {
        return this.stocksService.toggleStock(symbol, body.isActive);
    }

    @Get(':symbol/history')
    async getStockHistory(@Param('symbol') symbol: string) {
        return this.stocksService.getStockHistory(symbol);
    }
}