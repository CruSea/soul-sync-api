import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { Message } from 'amqplib';
import { RedisService } from 'src/common/redis/redis.service';
import { ChatService } from 'src/modules/chat/chat.service';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { tr } from '@faker-js/faker/.';

@Injectable()
export class MentorChatService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly QUEUE_NAME = 'chat_queue';

  constructor(
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      console.error('Error initializing MentorChatService:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.disconnect();
    } catch (error) {
      console.error('Error destroying MentorChatService:', error);
    }
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
      console.log('MentorChatService Connected!');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  private async disconnect() {
    try {
      await this.channel.close();
      await this.connection.close();
      console.log('MentorChatService Disconnected!');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
      throw error;
    }
  }

  async consume(email: string) {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (!msg || !msg.content || msg.content.length === 0) {
        console.error('Invalid message:', msg);
        this.channel.nack(msg, false, false);
        return;
      }

      try {
        if (await this.handleMessage(msg, email)) {
          this.channel.ack(msg);
        } else {
          throw new Error('handleMessage returned false');
        }
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel.nack(msg, false, true);
      }
    });
  }

  private async handleMessage(msg: Message, email: string): Promise<boolean> {
    const chatContent = msg.content.toString();
    const chat = JSON.parse(chatContent);

    try {
      const user = await this.prismaService.mentor.findFirst({
        where: { email: chat.metadata.email },
      });

      if (chat.payload.type === 'SENT') {
        try {
          await this.sendMessageExchangeData(chat);
          return true;
        } catch (error) {
          throw new Error('Error sending the message to telegram: ' + error);
        }
      }
      if (!user || user.email !== email) {
        throw new Error('Unauthorized access');
      }

      const socketId = await this.redisService.get(chat.metadata.email);
      if (!socketId || socketId === 'mentor is offline') {
        throw new Error('Mentor is offline');
      }
      await this.chatService.send(socketId, chat);
      console.log('Successfully sent the message!');
      return true;
    } catch (error) {
      console.log('Error handling the message: ', error);
      return false;
    }
  }

  private async sendMessageExchangeData(message: any) {
    const channel = await this.prismaService.channel.findFirst({
      where: { id: message.payload.channelId },
    });
    const channelType = channel?.type;
    if (channelType === 'TELEGRAM') {
      try {
        if (
          !message.payload ||
          !message.payload.address ||
          !message.payload.body
        ) {
          console.error('Invalid message payload:', message);
          return;
        }

        const config = channel.configuration as { token: string };
        const telegramApiUrl = `https://api.telegram.org/bot${config.token}/sendMessage`;
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
          return;
        }

        const telegramResponse = await response.json();
        if (!telegramResponse.ok) {
          console.error('Error sending message to Telegram:', telegramResponse);
          return;
        }

        console.log('Message sent to Telegram successfully:', telegramResponse);
      } catch (error) {
        console.error('Error sending message to Telegram:', error);
      }
    } else if (channelType === 'NEGARIT') {
      try {
        if (
          !message.payload ||
          !message.payload.address ||
          !message.payload.body
        ) {
          console.error('Invalid negarit message payload:', message);
          return;
        }

        const config = channel.configuration as {
          apiKey: string;
          campaignId: string;
        };
        const { apiKey, campaignId } = config;

        // Send the SMS via Negarit API
        const negaritApiUrl = `https://api.negarit.net/api/api_request/sent_message`;
        const payload = {
          API_KEY: apiKey,
          sent_to: message.payload.address,
          message: message.payload.body,
          campaign_id: campaignId,
        };
        console.log('The data sent to negarit:', payload);

        const response = await fetch(negaritApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Error sending message to Negarit:', errorResponse);
          return;
        }

        const negaritResponse = await response.json();

        console.log('Message sent to Negarit successfully:', negaritResponse);
        return true;
      } catch (error) {
        console.error('Error sending message to Negarit:', error);
        return false;
      }
    }
    //beqi implement your logic here
  }
}
