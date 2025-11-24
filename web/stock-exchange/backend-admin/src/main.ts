import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Основная функция запуска NestJS приложения
 * Настраивает CORS, health-check и запускает сервер
 */
async function bootstrap() {
    // Создаем экземпляр приложения NestJS
    const app = await NestFactory.create(AppModule);

    // Настраиваем CORS для разрешения запросов с указанных доменов
    app.enableCors({
        origin: ['http://localhost:3010', 'http://localhost:3012', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    });

    // Добавляем health-check endpoint для проверки статуса сервера
    app.getHttpAdapter().get('/api/health', (req, res) => {
        res.json({
            status: 'OK',
            message: 'NestJS backend is running!',
            timestamp: new Date().toISOString()
        });
    });

    // Запускаем сервер на порту 3011
    await app.listen(3011);
    console.log('✅ NestJS backend running on http://localhost:3011');
}

// Запускаем приложение
bootstrap();