import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../module/dto/create-message.dto';
import { MessageType } from '@prisma/client';
import { Strategy } from '../strategy/strategy';

@Injectable()
export class TelegramStrategyService implements Strategy {
  async SupportChannelType(type: string): Promise<boolean> {
    return type === 'telegram';
  }

  async FormatIncomingMessage(payload: any): Promise<CreateMessageDto> {
    return {
      type: MessageType.RECEIVED,
      body: payload.message,
      address: payload.userId,
      channelId: payload.channelId,
    };
  }
}
