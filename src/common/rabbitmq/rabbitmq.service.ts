import { Injectable } from '@nestjs/common';
import { Chat } from 'src/types/chat';
import { TelegramChat } from 'src/types/telegram';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RabbitmqService {
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
    return {
      id: uuidv4(),
      type: 'MESSAGE',
      metadata: {
        type: 'TELEGRAM',
        channelId: channelId,
      },
      payload: payload,
    };
  }

  getMessageEchangeDataNegarit(channelId: string, payload: any): any {
    return {
      id: uuidv4(),
      type: 'MESSAGE',
      metadata: {
        type: 'NEGARIT',
        channelId: channelId,
      },
      payload: payload,
    };
  }
}
