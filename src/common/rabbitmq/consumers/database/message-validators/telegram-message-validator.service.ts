import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageValidator } from '../Message-validator';

@Injectable()
export class TelegramMessageValidator implements MessageValidator {
  supports(type: string): boolean {
    return type === 'TELEGRAM';
  }

  validate(message: any): CreateMessageDto | null {
    if (
      !message.payload.message ||
      !message.payload.message.chat ||
      !message.payload.message.text
    ) {
      return null;
    }
    return {
      channelId: message.metadata.channelId,
      address: message.payload.message.chat.id.toString(),
      type: 'RECEIVED',
      body: message.payload.message.text,
    };
  }
}
