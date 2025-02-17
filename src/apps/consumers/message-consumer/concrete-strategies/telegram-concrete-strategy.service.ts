import { Injectable } from '@nestjs/common';
import { Strategy } from '../strategy/strategy';
import { SentMessageDto } from '../module/dto/sent-message.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MessageType } from '@prisma/client';

@Injectable()
export class TelegramStrategyService implements Strategy {
  constructor(private readonly prisma: PrismaService) {}
  supportChannelType(type: string): boolean {
    return type === 'TELEGRAM';
  }
  async formatIncomingMessage(payload: any): Promise<SentMessageDto> {
    const conversationId = await this.fetchConversationId(payload.address);
    return {
      conversationId: conversationId,
      type: MessageType.RECEIVED,
      body: payload.message.text,
      createdAt: new Date().toISOString(),
    };
  }
  async fetchConversationId(address: string){
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        address: address,
        isActive: true,
      },
    });
    return conversation.id;
  }
}
