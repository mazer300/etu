import { Global, Module } from '@nestjs/common';
import { DataService } from '../data/data.service';

@Global()
@Module({
    providers: [DataService],
    exports: [DataService],
})
export class CommonModule {}