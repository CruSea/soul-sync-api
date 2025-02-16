import { CreateMessageDto } from '../module/dto/create-message.dto';

export interface Strategy {
  SupportChannelType(type: string): Promise<boolean>;
  FormatIncomingMessage(payload: any): Promise<CreateMessageDto>;
}
