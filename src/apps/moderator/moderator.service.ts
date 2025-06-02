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
  ToolMessage,
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
    });
  }

  async handleMessage(data: any, context: RmqContext) {
    const channel = context.getChannelRef();
    const orgMsg = context.getMessage();

    try {
      const message = typeof data == 'string' ? JSON.parse(data) : data;

      this.conversationId = message.metadata.conversationId;

      const memory = new BufferMemory({
        chatHistory: new RedisChatMessageHistory({
          sessionId: this.conversationId,
          client: this.redis.getClient(),
        }),
        returnMessages: true,
      });

      const existingMessages = await memory.chatHistory.getMessages();

      if (!existingMessages ) {
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

      const topicExtractorSchema = z.object({
        topic: z
          .string()
          .describe('The topic of interest extracted from the conversation'),
      });

      const mentorIdExtractorSchema = z.object({
        mentorId: z
          .string()
          .describe("The selected mentor id")
      });

      const topicTool = tool(
        async ({ topic }) => {
          return this.assignMentor(topic);
        },
        {
          name: 'conversationTopicExtractor',
          description:
            'Extracts topic from conversation to help match with a mentor...',
          schema: topicExtractorSchema,
        },
      );

      const mentorIdTool = tool(
        async ({ mentorId }) => {
          return this.createNewConversation(mentorId);
        },
        {
          name: 'newConversation',
          description:
            'once the mentee chooses the mentor it desires, the chosen mentor id will be extracted and a new conversation with that mentor will be created.',
          schema: mentorIdExtractorSchema,
        },
      );
      
      const toolsByName = {
        conversationTopicExtractor: topicTool,
        newConversation: mentorIdTool,
      };

      const llmWithTools = this.llm.bindTools([
        ...Object.values(toolsByName),
      ]);
      

      const chain = new ConversationChain({
        llm: llmWithTools,
        memory,
      });

      const inputText = message.payload;
      let aiResponse = await chain.invoke({ input: inputText });
      let response: any;
      let messages: any[] = [];
      try {
        while (JSON.parse(aiResponse.response)) {
          let toolCalls = JSON.parse(aiResponse.response);

          for (const toolCall of toolCalls) {
            const selectedTool = await toolsByName[toolCall.functionCall.name];

            const toolResult = await selectedTool.invoke(
              toolCall.functionCall.args,
            );

            messages.push({
              tool_call: toolCall,
              output: toolResult,
            });

            aiResponse = await chain.invoke({
              input: JSON.stringify({ input: inputText, tools: messages }),
            });

            response = aiResponse.response;
          }
        }
        
      } catch {
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

      if (!mentor ) {
        return `Sorry, we couldn't find a suitable mentor at the moment.`;
      }
      return mentor;

     
    } catch (error) {
      console.error('Error during tool execution:', error);
      return 'Something went wrong while assigning a mentor.';
    }
  }

  async createNewConversation(mentorId) {
    
     const existingConversation = await this.prisma.conversation.update({
        where: { id: this.conversationId },
        data: { isActive: false },
     });
    
      this.conversationId = (
        await this.prisma.conversation.create({
          data: {
            isActive: true,
            address: existingConversation.address,
            channelId: existingConversation.channelId,
            mentorId,
          },
        })
      ).id;

      return 'New conversation created. User is now connected with a mentor.';
  }
}
