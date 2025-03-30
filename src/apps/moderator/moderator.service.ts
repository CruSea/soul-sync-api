import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ChatExchangeService } from '../../common/rabbitmq/chat-exchange/chat-exchange.service';
import { RabbitmqService } from '../../common/rabbitmq/rabbitmq.service';
import { Chat } from 'src/types/chat';

@Injectable()
export class ModeratorService {
  private llm: ChatGoogleGenerativeAI;
  public constructor(
    private prisma: PrismaService,
    private chatExchangeService: ChatExchangeService,
    private rabbitmqService: RabbitmqService,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      model: 'gemini-2.0-flash',
    });
  }

  async handleMessage(message: any, context: RmqContext) {
    const channel = context.getChannelRef();
    const orgMsg = context.getMessage();
    try {
      console.log({ message: message, context: context });

      const conversationId =
        message.metadata.conversationId ??
        (
          await this.prisma.conversation.findFirst({
            where: { address: message.metadata.address },
          })
        )?.id;

      const messageHistory = await this.prisma.message.findMany({
        where: {
          Threads: {
            some: {
              conversationId,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const messages = messageHistory.map(({ type, body }) => {
        return `${type === 'RECEIVED' ? 'mentor' : 'mentee'}: ${body}`;
      });
      messages.push(
        'system prompt: You are a human mentor, warm and approachable, guiding mentees with care and insight. Your goal is to understand their struggles as deeply as possible by asking thoughtful questions and making them feel heard. Keep the conversation light and engaging with a touch of humor, helping them relax and open up. Avoid robotic or dry responses—make your words feel natural, like a genuine human conversation. While being concise, ensure your responses hold meaning and value, never cutting out what truly matters. Keep it short, sweet, and impactful and your answers should be in plane text do not format it.',
      );

      const response = await this.llm.invoke(messages);
      const chat: Chat = {
        type: 'CHAT',
        metadata: {
          conversationId,
        },
        payload: response,
      };

      const formattedData = await this.rabbitmqService.getChatEchangeData(chat);

      this.chatExchangeService.send('chat', formattedData);
      channel.ack(orgMsg);
    } catch (error) {
      console.log(error.message);
      channel.nack(orgMsg);
    }
  }
}
