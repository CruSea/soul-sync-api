import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageValidator } from './Message-validator';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TelegramMessageValidator implements MessageValidator {
  constructor(private prismaService: PrismaService) {}
  supports(type: string): boolean {
    return type === 'CHAT';
  }

  validate(message: any): CreateMessageDto | null {
    if (!message.payload) {
      return null;
    }
    const conversation = this.fetchConversatio(message.metadata.conversationId);
    return {
      channelId: message.metadata.channelId,
      address: message.payload.message.chat.id.toString(),
      type: 'SENT',
      body: message.payload,
    };
  }

  private async fetchConversatio(conversationId: string) {
    const conversation = this.prismaService.conversation.findFirst({
      where: { id: conversationId },
    });
    return conversation;
  }
}
