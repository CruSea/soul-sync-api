import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Chat } from 'src/types/chat';
import { MessagePayload } from 'src/types/message';
import { TelegramChat } from 'src/types/telegram';

@Injectable()
export class RabbitmqService {
  constructor(private readonly prisma: PrismaService) {}
  getChatEchangeData(chat: Chat): MessagePayload {
    return {
      type: 'CHAT',
      metadata: {
        type: 'CHAT',
        conversationId: chat.metadata.conversationId,
      },
      payload: chat.payload,
    };
  }

  async getMessageEchangeData(payload: any): Promise<any> {
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
