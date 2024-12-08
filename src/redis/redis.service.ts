import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    this.redisClient = new Redis({
      host: 'redis', // Adjust host and port as needed
      port: 6379,
    });

    this.redisClient.on('connect', () => this.logger.log('Connected to Redis'));
    this.redisClient.on('error', (error) =>
      this.logger.error('Redis error', error),
    );
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redisClient.set(key, serializedValue, 'EX', ttl);
      } else {
        await this.redisClient.set(key, serializedValue);
      }
      this.logger.log(`Value set in Redis for key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set value in Redis for key: ${key}`, error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(
        `Failed to get value from Redis for key: ${key}`,
        error,
      );
      throw error;
    }
  }
}
