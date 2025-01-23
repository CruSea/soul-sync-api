import { MessageDto } from '../dto/message.dto';

export interface MessageTransmitterValidator {
  supports(type: string): boolean;
  extractmenteeAddress(Message: any): string | null;
  processMessage(message: any, conversationId: string): MessageDto | null;
}
