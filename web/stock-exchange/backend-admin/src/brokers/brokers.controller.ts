import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { CreateBrokerDto, UpdateBrokerDto } from './dto/broker.dto';

/**
 * Контроллер для работы с брокерами через REST API
 * Обрабатывает CRUD операции для брокеров
 */
@Controller('api/brokers')
export class BrokersController {
    constructor(private readonly brokersService: BrokersService) {}

    /**
     * GET /api/brokers
     * Возвращает список всех брокеров
     */
    @Get()
    async getAllBrokers() {
        return this.brokersService.getAllBrokers();
    }

    /**
     * GET /api/brokers/:id
     * Возвращает брокера по ID
     * @param id - ID брокера
     */
    @Get(':id')
    async getBroker(@Param('id') id: string) {
        return this.brokersService.getBroker(parseInt(id));
    }

    /**
     * POST /api/brokers
     * Создает нового брокера
     * @param createBrokerDto - данные для создания брокера
     */
    @Post()
    async createBroker(@Body() createBrokerDto: CreateBrokerDto) {
        return this.brokersService.createBroker(createBrokerDto);
    }

    /**
     * PUT /api/brokers/:id
     * Обновляет данные брокера
     * @param id - ID брокера
     * @param updateBrokerDto - новые данные брокера
     */
    @Put(':id')
    async updateBroker(@Param('id') id: string, @Body() updateBrokerDto: UpdateBrokerDto) {
        return this.brokersService.updateBroker(parseInt(id), updateBrokerDto);
    }

    /**
     * DELETE /api/brokers/:id
     * Удаляет брокера по ID
     * @param id - ID брокера для удаления
     */
    @Delete(':id')
    async deleteBroker(@Param('id') id: string) {
        return this.brokersService.deleteBroker(parseInt(id));
    }
}