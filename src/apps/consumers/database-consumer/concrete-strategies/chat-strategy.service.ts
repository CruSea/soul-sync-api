import { Injectable } from '@nestjs/common';
import { Strategy } from '../strategy/strategy';
import { CreateMessageDto } from '../module/dto/create-message.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ChatStrategyService implements Strategy {
  constructor(private readonly prisma: PrismaService) {}
  async SupportChannelType(type: string): Promise<boolean> {
    return type === 'CHAT';
  }
  async FormatIncomingMessage(payload: any): Promise<CreateMessageDto> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: payload.metadata.conversationId,
      },
    });
    return {
      type: payload.type,
      body: payload.payload,
      address: conversation.address,
      channelId: conversation.channelId,
    };
  }
}
