import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ChatExchangeService } from '../../common/rabbitmq/chat-exchange/chat-exchange.service';
import { RabbitmqService } from '../../common/rabbitmq/rabbitmq.service';
import { Chat } from 'src/types/chat';
import { EmbeddingService } from './embedding.service';
import { MODERATOR_MAIN_PROMPT, MODERATOR_EXTRACTION_PROMPT } from './prompt';
import { waitForConversationToBeCreated } from 'src/common/helpers/waitForConversation';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class ModeratorService {
  private llm: ChatGoogleGenerativeAI;

  public constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private chatExchangeService: ChatExchangeService,
    private rabbitmqService: RabbitmqService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      model: 'gemini-2.0-flash',
      maxOutputTokens: 50,
    });
  }

  async handleMessage(data: any, context: RmqContext) {
    const channel = context.getChannelRef();
    const orgMsg = context.getMessage();

    try {
      const message = typeof data == 'string' ? JSON.parse(data) : data;

      let conversationId =
        message.metadata.conversationId ??
        (await waitForConversationToBeCreated(
          this.prisma,
          message.metadata.address,
        ));

      if (!conversationId) {
        throw new Error('Conversation not found after retries.');
      }

      const cacheKey = `message_history:${conversationId}`;

      let messageHistory: any[] = JSON.parse(await this.redis.get(cacheKey));

      if (!messageHistory) {
        messageHistory = await this.prisma.message.findMany({
          where: { Threads: { some: { conversationId } } },
          orderBy: { createdAt: 'asc' },
        });

        await this.redis.set(cacheKey, JSON.stringify(messageHistory), 1200);
      }

      messageHistory.push({
        type: 'RECEIVED',
        body: message.payload,
      });

      await this.redis.set(cacheKey, JSON.stringify(messageHistory), 1200);

      let messages: any[] = [];

      messages = [
        {
          role: 'system',
          content: MODERATOR_MAIN_PROMPT,
        },
        ...messageHistory.map(({ type, body }) => ({
          role: type === 'RECEIVED' ? 'user' : 'assistant',
          content: body,
        })),
        {
          role: 'user',
          content: message.payload,
        },
      ];

      const aiMessage = await this.llm.invoke(messages);
      let response: any = aiMessage.text;

      if (response.trim().toLowerCase() === 'done') {
        messages[0] = {
          role: 'system',
          content: MODERATOR_EXTRACTION_PROMPT,
        };

        const summary = await this.llm.invoke(messages);
        response = summary.text;
      }

      const mentor = await this.embeddingService.handleEmbedding(
        response.topic,
        conversationId,
      );

      if (mentor) {
        const conversation = await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { isActive: false },
        });

        conversationId = (
          await this.prisma.conversation.create({
            data: {
              mentorId: mentor[0].id,
              ...conversation,
            },
          })
        ).id;

        response =
          "I've matched you with a mentor that best fits you, I wish you all the best";
      }

      const chat: Chat = {
        type: 'CHAT',
        metadata: {
          conversationId,
        },
        payload: response,
      };

      const formattedData = await this.rabbitmqService.getChatEchangeData(chat);
      await this.chatExchangeService.send('chat', formattedData);
      channel.ack(orgMsg);
    } catch (error) {
      console.log(error.message);
      channel.nack(orgMsg);
    }
  }
}
