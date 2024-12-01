import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { Prisma } from '@prisma/client';
import { ProducerService } from '../queue/producer.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly producerService: ProducerService,
  ) {}

  async create(data: Prisma.MessageCreateInput) {
    try {
      // Add message to the RabbitMQ queue
      await this.producerService.addToQueue(data);

      // Optionally return an acknowledgment
      return { status: 'Message added to queue successfully!' };
    } catch (error) {
      throw error; // Handle the error (e.g., log it)
    }
  }

  findAll() {
    return this.databaseService.message.findMany({});
  }

  findOne(uuid: string) {
    return this.databaseService.message.findUnique({
      where: {
        uuid,
      },
    });
  }

  async update(uuid: string, updateMessageDto: Prisma.MessageUpdateInput) {
    return this.databaseService.message.update({
      where: { uuid },
      data: updateMessageDto,
    });
  }

  async remove(uuid: string) {
    return this.databaseService.message.delete({
      where: { uuid },
    });
  }
}
