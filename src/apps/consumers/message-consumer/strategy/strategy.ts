import { SentMessageDto } from "../module/dto/sent-message.dto";

export interface Strategy {
  supportChannelType(type: string): boolean;
  formatIncomingMessage(payload: any): Promise<SentMessageDto>;
}
