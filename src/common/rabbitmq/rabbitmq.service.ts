import { P } from '@faker-js/faker/dist/airline-BnpeTvY9';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Chat } from 'src/types/chat';
import { TelegramChat } from 'src/types/telegram';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RabbitmqService {
  constructor(
    private readonly prisma: PrismaService
  ) {}
  getChatEchangeData(chat: Chat, socket: any): any {
    return {
      id: uuidv4(),
      type: 'CHAT',
      metadata: {
        userId: socket.user.id,
        conversationId: chat.metadata.conversationId,
      },
      payload: chat.payload,
      socket: socket,
    };
  }

  getMessageEchangeData(channelId: string, payload: any): any {
    const channelType = this.prisma.channel
      .findUnique({
        where: { id: channelId },
      })
      .then((channel) => channel.type);
    return {
      id: uuidv4(),
      type: 'MESSAGE',
      metadata: {
        type: channelType,
        channelId: channelId,
      },
      payload: payload,
    };
  }
}
