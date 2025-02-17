import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../module/dto/create-message.dto';
import { MessageType } from '@prisma/client';
import { Strategy } from '../strategy/strategy';

@Injectable()
export class TelegramStrategyService implements Strategy {
  supportChannelType(type: string): boolean {
    return type === 'TELEGRAM';
  }

  async formatIncomingMessage(payload: any): Promise<CreateMessageDto> {
    return {
      type: MessageType.RECEIVED,
      body: payload.payload.message.text,
      address: String(payload.payload.message.chat.id),
      channelId: payload.metadata.channelId,
    };
  }
}
