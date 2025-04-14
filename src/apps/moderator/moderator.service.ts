import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ChatExchangeService } from '../../common/rabbitmq/chat-exchange/chat-exchange.service';
import { RabbitmqService } from '../../common/rabbitmq/rabbitmq.service';
import { Chat } from 'src/types/chat';
import { EmbeddingService } from './embedding.service';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { MODERATOR_MAIN_PROMPT } from './prompt';
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
  private conversationId;

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

      this.conversationId = message.metadata.conversationId;

      while (!this.conversationId) {
        const conversation = await this.prisma.conversation.findFirst({
          where: { address: message.metadata.address, isActive: true },
          select: { id: true },
        });

        this.conversationId = conversation?.id;
      }

      const memory = new BufferMemory({
        chatHistory: new RedisChatMessageHistory({
          sessionId: this.conversationId,
          client: this.redis.getClient(),
        }),
        returnMessages: true,
      });

      const existingMessages = await memory.chatHistory.getMessages();

      // Load initial system message and DB history only once
      if (!existingMessages || existingMessages.length === 0) {
        await memory.chatHistory.addMessage(
          new SystemMessage(MODERATOR_MAIN_PROMPT),
        );

        const dbHistory = await this.prisma.message.findMany({
          where: { Threads: { some: { conversationId: this.conversationId } } },
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

      const topicTimeExtractorSchema = z.object({
        operation: z
          .enum(['tech', 'agri'])
          .describe('The topic must be either "tech" or "agri".'),
        topic: z
          .string()
          .describe(
            'Extracted topic. Valid values are only "tech" and "agri".',
          ),
        time: z.string().describe('The time mentioned in the conversation.'),
      });

      const mentorSelectorTool = tool(async () => {}, {
        name: 'mentorSelectorTool',
        description:
          'Extracts topic and time from conversation to help match with a mentor.',
        schema: topicTimeExtractorSchema,
      });

      const llmWithTools = this.llm.bindTools([mentorSelectorTool]);

      const chain = new ConversationChain({
        llm: llmWithTools,
        memory,
      });

      const inputText = message.payload || message.body || 'Hello';
      const aiResponse = await chain.call({ input: inputText });

      let response: any;
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(aiResponse.response);
        if (
          parsedResponse[0]?.functionCall
        ) {
          response = await this.assignMentor(
            parsedResponse[0].functionCall.args.topic,
          );
        } else {
          response = aiResponse.response || aiResponse.text || aiResponse;
        }
      } catch (error) {
       
        response = aiResponse.response;
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
      console.error(error.message);
      channel.nack(orgMsg);
    }
  }

  async assignMentor(topic) {
    try {
      const mentor = await this.embeddingService.handleEmbedding(
        topic,
        this.conversationId,
      );

      if (!mentor || mentor.length === 0) {
        return `Sorry, we couldn't find a suitable mentor at the moment.`;
      }

      const existingConversation = await this.prisma.conversation.update({
        where: { id: this.conversationId },
        data: { isActive: false },
      });

      const newMentor =
        typeof mentor === 'string' ? JSON.parse(mentor)[0] : mentor[0];

      this.conversationId = (
        await this.prisma.conversation.create({
          data: {
            isActive: true,
            address: existingConversation.address,
            channelId: existingConversation.channelId,
            mentorId: newMentor.id,
          },
        })
      ).id;

      return 'New conversation created. User is now connected with a mentor.';
    } catch (error) {
      console.error('Error during tool execution:', error);
      return 'Something went wrong while assigning a mentor.';
    }
  }
}
