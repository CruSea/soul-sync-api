import { Injectable } from '@nestjs/common';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.conversation.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.conversation
      .findFirst({
        where: { id: id },
        include: {
          Threads: {
            include: {
              Message: true,
            },
          },
        },
      })
      .then((conversation) => {
        if (conversation) {
          const formattedMessages = conversation.Threads.flatMap((thread) =>
            (Array.isArray(thread.Message)
              ? thread.Message
              : [thread.Message]
            ).map((message) => ({
              type: message.type,
              body: message.body,
              createdAt: message.createdAt.toISOString(),
            })),
          );

          return formattedMessages;
        }
        return [];
      });
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
}
