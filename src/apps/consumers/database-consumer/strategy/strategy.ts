import { CreateMessageDto } from '../module/dto/create-message.dto';

export interface Strategy {
  supportChannelType(type: string): boolean;
  formatIncomingMessage(payload: any): Promise<CreateMessageDto>;
}
