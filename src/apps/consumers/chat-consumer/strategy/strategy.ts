export interface Strategy {
  supportChannelType();
  sendMessage(message: any);
}
