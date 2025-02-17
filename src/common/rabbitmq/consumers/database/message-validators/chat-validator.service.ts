import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageValidator } from './Message-validator';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ChatMessageValidator implements MessageValidator {
  constructor(private prismaService: PrismaService) {}
  supports(type: string): boolean {
    return type === 'CHAT';
  }

  async validate(message: any): Promise<CreateMessageDto | null> {
    if (!message.payload) {
      return null;
    }
    const conversation = await this.fetchConversatio(
      message.metadata.conversationId,
    );
    return {
      channelId: conversation.channelId,
      address: conversation.address.toString(),
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
