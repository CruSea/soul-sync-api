import { Injectable } from '@nestjs/common';
import { Strategy } from '../strategy/strategy';
import { CreateMessageDto } from '../module/dto/create-message.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MessageType } from '@prisma/client';

@Injectable()
export class ChatStrategyService implements Strategy {
  constructor(private readonly prisma: PrismaService) {}
  supportChannelType(type: string): boolean {
    return type === 'CHAT';
  }
  async formatIncomingMessage(payload: any): Promise<CreateMessageDto> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: payload.metadata.conversationId,
      },
    });
    return {
      type: MessageType.SENT,
      body: payload.payload,
      address: conversation.address,
      channelId: conversation.channelId,
      conversationId: conversation.id
    };
  }
}
