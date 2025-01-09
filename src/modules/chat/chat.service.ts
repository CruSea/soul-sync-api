import { Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class ChatService {
    constructor(
        private redis: RedisService,
    ) { }
    
    async setClient(clientId: string, userId: string) {
        await this.redis.set(clientId, userId);
    }
}
