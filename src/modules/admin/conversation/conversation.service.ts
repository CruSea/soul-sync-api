import { Inject, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { REQUEST } from '@nestjs/core/router/request/request-constants';
import { ConversationDto } from './dto/conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) { }

  async create(createConversationDto: CreateConversationDto) {

    const conversationData = await this.prisma.conversation.create({
      data: {
        mentorId: createConversationDto.mentorId,
        address: createConversationDto.address,
        channelId: createConversationDto.channelId,
        isActive: true,
        isDeleted: false,

      },
    });

    return new ConversationDto(conversationData);
  }

  async findAll() {
    const conversations = await this.prisma.conversation.findMany({
      where: { isDeleted: false },
    });
    return conversations.map(conversation => new ConversationDto(conversation));
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: id,
        isDeleted: false
      },
    });

    if (!conversation) {
      throw new Error(`Conversation with id ${id} not found`);
    }

    return new ConversationDto(conversation);
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  async remove(id: string) {
    const conversation = await this.prisma.conversation.update({
      where: { id: id },
      data: { isDeleted: true },
    });
    return { message: `Conversation with the #${id} deleted successfully!` };
  }
}