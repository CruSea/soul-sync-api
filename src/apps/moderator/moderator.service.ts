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

@Injectable()
export class ModeratorService {
  private llm: ChatGoogleGenerativeAI;
  private conversationId;
  public constructor(
    private prisma: PrismaService,
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
        (
          await this.prisma.conversation.findFirst({
            where: { address: message.metadata.address, isActive: true },
          })
        )?.id;

      const messageHistory = await this.prisma.message.findMany({
        where: {
          Threads: {
            some: {
              conversationId: this.conversationId,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      let messages: any[] = [];

      messages = [
        {
          role: 'system',
          content: `
            You are a friendly assistant on the LeyuChat platform. Your job is to chat naturally and guide users to find the right mentor. 
            the topic, and a preferred time, extract those details.
            Keep responses short, friendly, and helpful. When enough info is available, use the right tool to match them with a mentor.
          `,
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

      let response: any;

      const topicTimeExtractorSchema = z.object({
        operation: z
          .enum(['tech', 'agri'])
          .describe(
            'The topic area of the conversation should only be tech or agri. only this fields are valid else from that are not valid topics so it should come down to these topics.',
          ),
        topic: z
          .string()
          .describe(
            'The topic extracted from the conversation. currently valid inputs for this field will be only "tech" and "agri"',
          ),
        time: z.string().describe('The time mentioned in the conversation.'),
      });

      const mentorSelectorTool = tool(async () => {}, {
        name: 'mentorSelectorTool',
        description:
          'Extracts the topic and time from the conversation with the mentee so that it can match them with the right mentor.',
        schema: topicTimeExtractorSchema,
      });

      const llmWithTools = this.llm.bindTools([mentorSelectorTool]);
      const res = await llmWithTools.invoke(messages);

      if (res.tool_calls && res.tool_calls.length > 0) {
        const toolCall = res.tool_calls[0];
        response = await this.assignMentor(toolCall.args.topic);
      } else {
        response = res.content;
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
