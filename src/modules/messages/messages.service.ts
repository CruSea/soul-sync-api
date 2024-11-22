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

  // update(id: number, updateMessageDto: UpdateMessageDto) {
  //   return `This action updates a #${id} message`;
  // }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
