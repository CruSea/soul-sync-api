import { MessageDto } from "../dto/message.dto";
import { Message } from '../../../../../modules/message/entities/message.entity';

export interface MessageTransmitterValidator {
  supports(type: string): boolean;
  extractmenteeAddress(Message: any): string | null;
  validate(message: any, conversationId: string): MessageDto | null;
}