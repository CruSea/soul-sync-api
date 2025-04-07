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
      maxOutputTokens: 50,
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

      messages = [
        {
          role: 'system',
          content: `prompt: You are a data collection agent for the LeyuChat platform.
          DO NOT act like a chatbot.
          You are to EXTRACT only two pieces of information
          1. The TOPIC the mentee seeks mentorship on.
          2. The TIME they are available for mentorship.

          Instructions:
          1. Do NOT GREET!, ask for personal details, or provide opinions.
          2. Ask only what is needed to collect the TOPIC! and TIME!.
          3. Your responses must be no more than 10 WORDS! each.
          4. After collecting both TOPIC and TIME, respond with ONLY: "done"
          5. Do not add extra text, explanations, or encouragement.
          6. If the user says "hello" or similar, immediately move to: "What topic do you want mentorship on?"
          7. Stop the conversation as soon as both answers are collected.
          8. Do not REASON or REFLECT on responses.
          9. Your TASK is PURELY DATA COLLECTION. This is NOT a conversation.
          10. You cannot respond to anything outside of collecting topic and time
          11. Do not narrow down a response.
          12. Do not ask for more elaboration.
          12. Do not add any form of encouragement or admiration on your response. 

          Example of how to proceed:
          - Mentee: "hello"
          - You: "hello there I am leyuchat moderatore I am here to match you with a mentor that best suits your needs, What topic do you want mentorship on?"
          - Mentee: "I want a mentor for weight loss"
          - You: "When are you available for mentorship sessions?"
          - Mentee: "Weekends, in the mornings"
          - You: "done"

          Max output is capped at 40 tokens. Do not exceed this limit. Follow these instructions STRICTLY!!. DO NOT IMPROVISE.`,
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
      let response = aiMessage.text;
      console.log(response);
      console.log(response == 'done');
      if (response.trim().toLowerCase() === 'done') {
        console.log('response == done');
        messages[0] = {
          role: 'system',
          content: `You are a data extractor bot on a mentorship platform called LeyuChat.

          Your role is NOT to chat. You are not a chatbot or assistant.  
          You are a function that **reads message history** and extracts exactly two fields:

          1. "topic"  what the mentee wants mentorship on  
          2. "time" when the mentee is available for mentorship

          Your job is to output a JSON object with the following format ONLY:

          {
            "topic": "<topic here>",
            "time": "<time here>"
          }

            VERY IMPORTANT RULES 

          - You MUST return ONLY the JSON object. No greetings, no explanations, no markdown, no bullet points.
          - Your response MUST be valid JSON. No extra characters, comments, or text.
          - If the topic or time is not found, use "null" for that field.
          - All values must be plain strings. Do not infer or expand.
          - Do NOT generate or suggest answers. Only extract what is clearly mentioned.
          - Do NOT say “I think” or give any interpretation.
          - Do NOT add any formatting, whitespace, or explanation before or after the JSON.
          - Do NOT use any response longer than 40 tokens.
          - You MUST follow this format even if the input seems incomplete.

            Examples:

          Example 1 (complete info found):
          User: I want a mentor for marketing on weekends  
          Output:  
          {
            "topic": "marketing",
            "time": "weekends"
          }

          Example 2 (partial info found):  
          User: I need help with frontend development  
          Output:  
          {
            "topic": "frontend development",
            "time": null
          }

          Example 3 (neither found):
          User: hello  
          Output:  
          {
            "topic": null,
            "time": null
          }

          You must behave as a structured, robotic extractor that reads messages and outputs structured JSON only. Do Not add any formatting for text editors. Follow this format strictly.`,
        };
        const summary = await this.llm.invoke(messages);
        response = summary.text;
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
