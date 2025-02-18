import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../module/dto/create-message.dto';
import { MessageType } from '@prisma/client';
import { Strategy } from '../strategy/strategy';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TelegramStrategyService implements Strategy {
  constructor(
    private readonly prisma: PrismaService,
  ) { }
  supportChannelType(type: string): boolean {
    return type === 'TELEGRAM';
  }

  async formatIncomingMessage(payload: any): Promise<CreateMessageDto> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        address: String(payload.payload.message.chat.id),
        isActive: true,
      }
    })
    return {
      type: MessageType.RECEIVED,
      body: payload.payload.message.text,
      address: String(payload.payload.message.chat.id),
      channelId: payload.metadata.channelId,
      conversationId: conversation.id
    };
  }
}
