import { Injectable } from '@nestjs/common';
import { SendChatInterface } from './send-chat.interface';
import { SentChatDto } from '../dto/sent-chat.dto';

@Injectable()
export class TelegramChatValidator implements SendChatInterface {
  support(): string {
    return 'TELEGRAM';
  }

  async send(chat: SentChatDto): Promise<boolean> {
    const token = chat.channelConfig?.token;
    const address = chat.address;
    const body = chat.body;
    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: address,
        text: body,
      }),
    });

    const telegramResponse = await response.json();
    if (!telegramResponse.ok) {
      console.error('Error sending message to Telegram:', telegramResponse);
      return false;
    }

    console.log('Message sent to Telegram successfully:', telegramResponse);
    return true;
  }
}
