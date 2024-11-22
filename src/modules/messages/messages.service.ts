import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly databaseService: DatabaseService){}
  
  async create(createMessageDto: Prisma.MessageCreateInput) {
    return this.databaseService.message.create({data: createMessageDto});
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
      where: {uuid}
    });
  }
}
