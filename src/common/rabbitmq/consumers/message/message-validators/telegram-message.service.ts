import { Injectable } from "@nestjs/common";
import { MessageTransmitterValidator } from "./message-validator";
import { MessageDto, MessageType } from "../dto/message.dto";

@Injectable()
export class TelegramMessageValidatorService implements MessageTransmitterValidator {
    supports(type: string): boolean {
        return type === 'telegram';
    }
    extractmenteeAddress(message: any): string | null {
        if (!message.payload.message || !message.payload.message.chat || !message.payload.message.text) {
            return null;
        }
        return message.payload.message.chat.id.toString();
    }
    processMessage(message: any, conversationId: string): MessageDto | null {
        return {
          body: message.payload.message.text,
          conversationId,
          createdAt: new Date().toISOString(),
          type: MessageType.RECEIVED,
        };
    }
 }