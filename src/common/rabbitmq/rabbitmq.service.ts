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

  async getMessageEchangeData(
    channelId: string,
    payload: TelegramChat,
  ): Promise<Chat> {
    let channelType;

    try {
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new Error(`Channel with ID ${channelId} not found`);
      }

      channelType = channel.type;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve channel type');
    }
    return {
      type: 'MESSAGE',
      metadata: {
        type: channelType,
        channelId: channelId,
      },
      payload: payload,
    };
  }
}
