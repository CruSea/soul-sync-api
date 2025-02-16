export interface Strategy {
  supportChannelType(type: string): boolean;
  sendMessage(message: any);
}
