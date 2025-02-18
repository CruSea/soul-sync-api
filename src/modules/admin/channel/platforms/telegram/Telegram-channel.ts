import { Injectable, HttpException } from '@nestjs/common';
import { ChannelStrategy } from '../../interface/channelStrategy.interface';

@Injectable()
export class TelegramChannel implements ChannelStrategy {
  async connect(
    channel: any,
  ): Promise<{ ok: boolean; result: boolean; description: string }> {
    const token = channel.configuration?.token;
    if (!token) {
      throw new HttpException('Invalid Telegram configuration', 400);
    }

    const resp = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${process.env.HOST_URL}/message/telegram?id=${channel.id}`,
        }),
      },
    );

    if (!resp.ok) {
      throw new HttpException(
        `Failed to connect: ${resp.statusText}`,
        resp.status,
      );
    }

    return { ok: true, result: true, description: 'Webhook is connected' };
  }

  async disconnect(
    channel: any,
  ): Promise<{ ok: boolean; result: boolean; description: string }> {
    const token = channel.configuration?.token;
    if (!token) {
      throw new HttpException('Invalid Telegram configuration', 400);
    }

    const resp = await fetch(
      `https://api.telegram.org/bot${token}/deleteWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${process.env.HOST_URL}/message/telegram?id=${channel.id}`,
        }),
      },
    );

    if (!resp.ok) {
      throw new HttpException(
        `Failed to disconnect: ${resp.statusText}`,
        resp.status,
      );
    }

    return { ok: true, result: false, description: 'Webhook is disconnected' };
  }
}
