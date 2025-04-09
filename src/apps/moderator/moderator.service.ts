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
  private conversationId: string;

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

      this.conversationId =
        message.metadata.conversationId ??
        (await waitForConversationToBeCreated(
          this.prisma,
          message.metadata.address,
        ));

      if (!this.conversationId) {
        throw new Error('Conversation not found after retries.');
      }

      const cacheKey = `message_history:${this.conversationId}`;

      let messageHistory: any[] = JSON.parse(await this.redis.get(cacheKey));

      if (!messageHistory) {
        messageHistory = await this.prisma.message.findMany({
          where: { Threads: { some: { conversationId: this.conversationId } } },
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
        response = JSON.parse(summary.text);
        const mentor = await this.embeddingService.handleEmbedding(
          response.topic,
          this.conversationId,
        );
        if (mentor) {
          const conversation = await this.prisma.conversation.update({
            where: { id: this.conversationId },
            data: { isActive: false },
            select: { address: true, channelId: true },
          });

          this.conversationId = (
            await this.prisma.conversation.create({
              data: {
                mentorId: mentor[0].metadata.mentorId,
                ...conversation,
                isActive: true,
              },
            })
          ).id;
          response =
            "I've matched you with a mentor that best fits you, I wish you all the best";
        }
      }

      const chat: Chat = {
        type: 'CHAT',
        metadata: {
          conversationId: this.conversationId,
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
