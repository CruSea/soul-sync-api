export class Channel {
  id: string;
  name: string;
  accountId: string;
  metadata: Record<string, any>;
  configuration: Record<string, any>;

  static create(data: any) {
    const channel = new Channel();
    Object.assign(channel, data);
    return channel;
  }
}
