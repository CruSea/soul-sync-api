import { SentMessageDto } from "../module/dto/sent-message.dto";

export interface Strategy {
  SupportChannelType(type: string): Promise<boolean>;
  FormatIncomingMessage(payload: any): Promise<SentMessageDto>;
}
