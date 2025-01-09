import Redis from 'ioredis';

export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD ,
    });

    this.redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, 'EX', ttlSeconds); 
    } else {
      await this.redisClient.set(key, value); 
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key); 
  }

  async delete(key: string): Promise<number> {
    return await this.redisClient.del(key); 
  }

  async disconnect(): Promise<void> {
    await this.redisClient.quit(); 
    console.log('Redis connection closed');
  }
}
