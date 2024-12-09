// messages.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly apiUrl = process.env.TELEGRAM_BOT_API_URL;

  async sendMessageToTelegram({ senderId, channelId, message, menteeChatId }: { senderId: string; channelId: string; message: string; menteeChatId: number }) {
    try {
      const response = await axios.post(this.apiUrl, {
        chat_id: menteeChatId, 
        text: message,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to send message',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
