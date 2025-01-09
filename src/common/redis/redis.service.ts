import Redis from 'ioredis';

export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
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

    if (ttlSeconds) {
      await this.redisClient.set(value, key, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(value, key);
    }
  }

  async get(key: string): Promise<string | null> {
    const value = await this.redisClient.get(key);

    if (value === null) {
      const reverseValue = await this.redisClient.get(key);
      return reverseValue;
    }

    return value;
  }

  async delete(key: string): Promise<number> {
    const result = await this.redisClient.del(key);
    await this.redisClient.del(await this.redisClient.get(key));
    
    return result;
  }

  async disconnect(): Promise<void> {
    await this.redisClient.quit();
    console.log('Redis connection closed');
  }
}
