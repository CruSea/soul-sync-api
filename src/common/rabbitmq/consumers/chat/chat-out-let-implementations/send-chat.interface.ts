import { SentChatDto } from '../dto/sent-chat.dto';

export interface SendChatInterface {
  supports(type: string): boolean;
  send(chat: SentChatDto): Promise<any>;
}
