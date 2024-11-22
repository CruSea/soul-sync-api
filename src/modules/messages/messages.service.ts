import { Injectable } from '@nestjs/common';
import { UpdateMessageDto } from './dto/update-message.dto';
import { DatabaseService } from 'src/modules/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly databaseService: DatabaseService){}
  
  async create(createMessageDto: Prisma.MessageCreateInput) {
    return this.databaseService.message.create({data: createMessageDto});
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
