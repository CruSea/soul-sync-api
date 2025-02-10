export interface ChannelStrategy {
  connect(
    channel: any,
  ): Promise<{ ok: boolean; result: boolean; description: string }>;
  disconnect(
    channel: any,
  ): Promise<{ ok: boolean; result: boolean; description: string }>;
}
