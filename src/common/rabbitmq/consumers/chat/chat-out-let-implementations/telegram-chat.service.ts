import { Injectable } from '@nestjs/common';
import { SendChatInterface } from './send-chat.interface';

@Injectable()
export class TelegramChatValidator implements SendChatInterface {
  support(): string {
    return 'TELEGRAM';
  }

  async send(message: any): Promise<boolean> {
    const telegramApiUrl = `https://api.telegram.org/bot${message.configuration.token}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: message.payload.address,
        text: message.payload.body,
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Error sending message to Telegram:', errorResponse);
      return false;
    }

    const telegramResponse = await response.json();
    if (!telegramResponse.ok) {
      console.error('Error sending message to Telegram:', telegramResponse);
      return false;
    }

    console.log('Message sent to Telegram successfully:', telegramResponse);
    return true;
  }
}
