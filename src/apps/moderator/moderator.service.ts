import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ChatExchangeService } from '../../common/rabbitmq/chat-exchange/chat-exchange.service';
import { RabbitmqService } from '../../common/rabbitmq/rabbitmq.service';
import { Chat } from 'src/types/chat';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class ModeratorService {
  private llm: ChatGoogleGenerativeAI;
  public constructor(
    private prisma: PrismaService,
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

      const conversationId =
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
              conversationId,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      let messages: any[] = [];

      messages.push({
        role: 'system',
        content:
          "You are an AI assistant designed to conduct a comprehensive interview with a mentee seeking mentorship. Your objective is to extract detailed information about the mentee's goals, interests, challenges, and preferences to facilitate an optimal mentor-mentee match. Please ask open-ended questions and encourage elaboration where necessary. Ensure that the conversation covers the following areas:\n\n1. **Career Aspirations:** Understand the mentee's professional objectives and desired career trajectory.\n2. **Skills and Expertise:** Identify the mentee's current skill set and areas where they seek development.\n3. **Challenges and Obstacles:** Explore any professional or personal challenges hindering their progress.\n4. **Learning Preferences:** Determine the mentee's preferred learning styles and formats (e.g., one-on-one, group sessions, online courses).\n5. **Availability and Commitment:** Assess the mentee's availability for mentorship sessions and their commitment level.\n6. **Expectations from Mentorship:** Clarify what the mentee hopes to achieve through the mentorship relationship.\n7. **Cultural and Personal Considerations:** Gather any cultural, personal, or contextual information that might influence the mentorship dynamics.\n\nAfter collecting this information, summarize the key points to create a comprehensive profile of the mentee's needs and preferences.",
      });

      messages = [
        ...messageHistory.map(({ type, body }) => ({
          role: type === 'RECEIVED' ? 'user' : 'assistant',
          content: body,
        })),
        {
          role: 'user',
          content: message.payload,
        },
      ];

      const response = await this.llm.invoke(messages);
      const chat: Chat = {
        type: 'CHAT',
        metadata: {
          conversationId,
        },
        payload: response.text,
      };

      const formattedData = await this.rabbitmqService.getChatEchangeData(chat);
      this.chatExchangeService.send('chat', formattedData);

      messages.push({
        role: 'assistant',
        content: response.text,
      });

      messages[0] = {
        role: 'system',
        content:
          "You are an AI assistant tasked with summarizing a series of conversation messages between a mentee and a bot. Your goal is to extract and structure key information to facilitate matching the mentee with a suitable mentor. Please analyze the provided conversation history and generate a summary that includes the following fields:\n\n1. **Mentee's Goals and Objectives:** Clearly outline the primary goals and aspirations expressed by the mentee.\n2. **Areas of Interest or Focus:** Identify specific subjects or fields the mentee is interested in.\n3. **Challenges and Obstacles:** Highlight any challenges the mentee is facing.\n4. **Preferred Learning Style:** Note the mentee's preferred learning methods.\n5. **Experience Level:** Assess the mentee's current level of experience in their areas of interest.\n6. **Short-Term and Long-Term Plans:** Summarize any plans or timelines discussed by the mentee.\n7. **Specific Questions or Concerns:** List any particular questions or concerns raised by the mentee.\n8. **Additional Relevant Information:** Include any other pertinent details that could aid in matching the mentee with an appropriate mentor.\n\nEnsure that the summary is concise yet comprehensive, capturing the essence of the mentee's needs and preferences. Structure the information in a way that allows for effective comparison with mentors' expertise profiles stored in JSON format within the EmbeddingService.handleEmbedding function.",
      };
      const summary = await this.llm.invoke(messages);
      const mentor = await this.embeddingService.handleEmbedding(
        message.metadata.channelId,
        summary.text,
      );
      if (mentor) {
        await this.prisma.conversation.update({
          where: {
            id: message.metadata.conversationId,
          },
          data: { isActive: false },
        });
        await this.prisma.conversation.create({
          mentorId: mentor[0].metadata.mentorId,
          ...message.metadata,
        });
      }
      channel.ack(orgMsg);
    } catch (error) {
      console.log(error.message);
      channel.nack(orgMsg);
    }
  }
}
