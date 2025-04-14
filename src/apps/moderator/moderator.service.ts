import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ChatExchangeService } from '../../common/rabbitmq/chat-exchange/chat-exchange.service';
import { RabbitmqService } from '../../common/rabbitmq/rabbitmq.service';
import { Chat } from 'src/types/chat';
import { EmbeddingService } from './embedding.service';
import { MODERATOR_MAIN_PROMPT, MODERATOR_EXTRACTION_PROMPT } from './prompt';
import { RedisService } from 'src/common/redis/redis.service';
import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { ConversationChain } from 'langchain/chains';
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from '@langchain/core/messages';

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

      let conversationId = message.metadata.conversationId;

      while (!conversationId) {
        const conversation = await this.prisma.conversation.findFirst({
          where: { address: message.metadata.address, isActive: true },
          select: { id: true },
        });

        conversationId = conversation?.id;
      }

      const memory = new BufferMemory({
        chatHistory: new RedisChatMessageHistory({
          sessionId: conversationId,
          sessionTTL: process.env.SESSION_TTL,
          client: this.redis.getClient(),
        }),
        returnMessages: true,
      });

      const existingMessages = await memory.chatHistory.getMessages();
      if (!existingMessages || existingMessages.length === 0) {
        await memory.chatHistory.addMessage(
          new SystemMessage(MODERATOR_MAIN_PROMPT),
        );

        const dbHistory = await this.prisma.message.findMany({
          where: { Threads: { some: { conversationId } } },
          orderBy: { createdAt: 'asc' },
        });

        for (const msg of dbHistory) {
          if (msg.type === 'RECEIVED') {
            await memory.chatHistory.addMessage(new HumanMessage(msg.body));
          } else {
            await memory.chatHistory.addMessage(new AIMessage(msg.body));
          }
        }
      }

      const chain = new ConversationChain({ llm: this.llm, memory });

      const res = await chain.invoke({ input: message.payload });
      let response = res.response;

      if (response.trim().toLowerCase() === 'done') {
        await memory.chatHistory.addMessage(
          new SystemMessage(MODERATOR_EXTRACTION_PROMPT),
        );
        const summaryRes = await chain.invoke({ input: message.payload });

        const summaryText = summaryRes.response;

        response = JSON.parse(summaryText);

        const mentor = await this.embeddingService.handleEmbedding(
          response.topic,
          conversationId,
        );
        if (mentor) {
          const conversation = await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { isActive: false },
            select: { address: true, channelId: true },
          });

          conversationId = (
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
          conversationId,
        },
        payload: JSON.stringify(response),
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
