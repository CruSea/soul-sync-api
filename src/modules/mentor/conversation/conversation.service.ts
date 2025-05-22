import { Injectable } from '@nestjs/common';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/helpers/pagination';
import { GetConversationDto } from './dto/get-conversation.dto';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: Record<string, any>) {
    const getConversationDto = new GetConversationDto();
    getConversationDto.accountId = query.accountId;

    const paginationDto = new PaginationDto();
    paginationDto.page = query.page ? parseInt(query.page) : 1;
    paginationDto.limit = query.limit ? parseInt(query.limit) : 10;

    const result = await paginate(
      this.prisma,
      this.prisma.conversation,
      {
        Channel: {
          accountId: getConversationDto.accountId,
        },
      },
      paginationDto.page,
      paginationDto.limit,
      {
        Channel: {
          select: {
            name: true,
            type: true,
            accountId: true,
          },
        },
        Mentor: {
          select: {
            name: true,
          },
        },
      },
    );

    const transformedData = (result.data as Array<any>).map((conversation) => ({
      mentorName: conversation.Mentor?.name,
      conversationId: conversation.id,
      platform: conversation.Channel?.type,
      channelName: conversation.Channel?.name,
    }));

    return {
      ...result,
      data: transformedData,
    };
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id },
      include: {
        Threads: {
          include: {
            Message: true,
          },
        },
      },
    });

    if (!conversation) return [];

    const formattedMessages = conversation.Threads.flatMap((thread) =>
      (Array.isArray(thread.Message) ? thread.Message : [thread.Message]).map(
        (message) => ({
          type: message.type,
          body: message.body,
          createdAt: message.createdAt.toISOString(),
        }),
      ),
    );

    return formattedMessages;
  }

  update(id: string, updateConversationDto: UpdateConversationDto) {
    return this.prisma.conversation.update({
      where: { id: id },
      data: updateConversationDto,
    });
  }

  remove(id: string) {
    return this.prisma.conversation.delete({ where: { id: id } });
  }

  async changeMentor(conversationId: string, mentorId: string) {
    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        mentorId: mentorId,
      },
      include: {
        Mentor: true,
      },
    });

    return {
      mentorName: conversation.Mentor.name,
      message: 'Mentor updated successfully!',
    };
  }
}
