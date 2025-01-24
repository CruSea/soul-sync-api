import { SentChatDto } from '../dto/sent-chat.dto';

export interface SendChatInterface {
  support(): string;
  send(chat: SentChatDto): Promise<any>;
}
