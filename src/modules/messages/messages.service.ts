import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { RedisService } from 'src/redis/redis.service';
//import { ProducerService } from '../queue/producer.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
    //private readonly producerService: ProducerService,
  ) {}

  async create(data: Prisma.MessageCreateInput) {
    try {
      // Save the message directly to the database
      const savedMessage = await this.databaseService.message.create({
        data,
      });

      // Cache in Redis
      const redisKey = `message:${savedMessage.uuid}`;
      await this.redisService.set(redisKey, savedMessage, 3600); // Cache for 1 hour
      Logger.log('Message cached in Redis');

      Logger.log(`Message saved!`, 'MessageService');
      return { status: 'Message saved successfully!', savedMessage };
    } catch (error) {
      Logger.error(
        'Failed to save message to the database',
        error,
        'MessageService',
      );
      throw new HttpException(
        'Failed to save message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieve all messages, first checking Redis.
   */
  async findAll() {
    const redisKey = 'all:messages';

    // Check Redis cache first
    const cachedMessages =
      await this.redisService.get<Prisma.MessageCreateInput[]>(redisKey);
    if (cachedMessages) {
      Logger.log('Cache hit for all messages');
      return cachedMessages;
    }

    // Fallback to the database
    const messages = await this.databaseService.message.findMany({});
    Logger.log('Cache miss for all messages. Fetching from database.');

    // Cache the result in Redis
    await this.redisService.set(redisKey, messages, 3600); // Cache for 1 hour
    return messages;
  }

  /**
   * Retrieve a single message by UUID, first checking Redis.
   */
  async findOne(uuid: string) {
    const redisKey = `message:${uuid}`;

    // Check Redis cache first
    const cachedMessage =
      await this.redisService.get<Prisma.MessageCreateInput>(redisKey);
    if (cachedMessage) {
      Logger.log(`Cache hit for message: ${uuid}`);
      return cachedMessage;
    }

    // Fallback to the database
    const message = await this.databaseService.message.findUnique({
      where: { uuid },
    });
    if (!message) {
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
    }

    Logger.log(`Cache miss for message: ${uuid}. Fetching from database.`);

    // Cache the result in Redis
    await this.redisService.set(redisKey, message, 3600); // Cache for 1 hour
    return message;
  }

  async update(uuid: string, updateMessageDto: Prisma.MessageUpdateInput) {
    const updatedMessage = await this.databaseService.message.update({
      where: { uuid },
      data: updateMessageDto,
    });

    // Update Redis cache
    const redisKey = `message:${uuid}`;
    await this.redisService.set(redisKey, updatedMessage, 3600);
    Logger.log(`Updated cache for message: ${uuid}`);
    return updatedMessage;
  }

  async remove(uuid: string) {
    const deletedMessage = await this.databaseService.message.delete({
      where: { uuid },
    });

    // Remove from Redis cache
    const redisKey = `message:${uuid}`;
    await this.redisService.set(redisKey, null);
    Logger.log(`Removed cache for message: ${uuid}`);
    return deletedMessage;
  }
}
