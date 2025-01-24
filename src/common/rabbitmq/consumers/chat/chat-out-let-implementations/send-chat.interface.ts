export interface SendChatInterface {
  support(): string;
  send(message: any): Promise<any>;
}
