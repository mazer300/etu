import { Controller, Get } from '@nestjs/common';

@Controller('api/health')
export class HealthController {
    @Get()
    checkHealth() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'backend-admin'
        };
    }
}