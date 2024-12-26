import { Module } from '@nestjs/common'; 
import { RabbitService } from './rabbit.service';
@Module({
    imports: [],
    controllers: [],
    providers: [RabbitService],
    exports: [RabbitService],
})
export class RabbitModule {}
