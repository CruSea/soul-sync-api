import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Chat } from 'src/types/chat';
import { MessagePayload } from 'src/types/message';

@Injectable()
export class RabbitmqService {
  constructor(private readonly prisma: PrismaService) {}
  async getChatEchangeData(chat: Chat): Promise<MessagePayload> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: chat.metadata.conversationId,
      },
    });
    return {
      type: 'CHAT',
      metadata: {
        conversationId: conversation?.id,
        channelId: conversation.channelId,
        address: conversation.address,
      },
      payload: chat.payload,
    };
  }

  async getMessageEchangeData(payload: any): Promise<Chat> {
    return {
      type: 'MESSAGE',
      metadata: {
        channelId: payload.channelId,
        address: payload.address,
        conversationId: payload.conversationId,
      },
      payload: payload.body,
    };
  }
}
