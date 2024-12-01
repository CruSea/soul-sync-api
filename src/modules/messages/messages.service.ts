import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { Prisma } from '@prisma/client';
//import { ProducerService } from '../queue/producer.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly databaseService: DatabaseService,
    //private readonly producerService: ProducerService,
  ) {}

  async create(data: Prisma.MessageCreateInput) {
    try {
      // Save the message directly to the database
      const savedMessage = await this.databaseService.message.create({
        data,
      });

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
