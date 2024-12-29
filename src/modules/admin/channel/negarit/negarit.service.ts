import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as https from 'https';
import { extractAccountIdFromToken } from '../utility/exractId';
import { JwtService } from '@nestjs/jwt';

export type MultipleSmsType = {
  id: string;
  message: string;
  phone: string;
};

@Injectable()
export class NegaritService {
  private userId: string;

  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  private readonly singleSmsUrl = 'https://api.negarit.net/api/api_request/sent_message';
  private readonly bulkSms = "https://api.negarit.net/api/api_request/sent_multiple_messages";
  private readonly allMessages = "https://api.negarit.net/api/api_request/received_messages";

  private async makeRequest(method: string, url: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        method,
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(data));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (payload) {
        req.write(JSON.stringify(payload));
      }

      req.end();
    });
  }

  // Send single SMS and store message in the database
  async sendSms(apiKey: string, sentTo: string, message: string, campaignId: string, token: string): Promise<any> {
    try {
      // Extract the user ID and account ID from the token using the utility function
      this.userId = (await extractAccountIdFromToken(token, this.jwtService, this.prisma)).userId;
      console.log('User ID:', this.userId);
      // Step 1: Send the SMS via Negarit API
      const url = `${this.singleSmsUrl}?API_KEY=${apiKey}`;
      const payload = {
        API_KEY: apiKey,
        sent_to: sentTo,
        message: message,
        campaign_id: campaignId,
      };

      const response = await this.makeRequest('POST', url, payload);

      // Step 2: Store the message in the database
      const channel = await this.prisma.channel.findFirst({
        where: { name: 'Negarit' },
      });

      if (!channel) {
        throw new HttpException('Channel not found', HttpStatus.BAD_REQUEST);
      }

      const user = await this.prisma.user.findUnique({
        where: { username: sentTo }, // sentTo is assumed to be the phone number
      });

      const senderId = user ? user.id : null;

      const messageRecord = await this.prisma.message.create({
        data: {
          content: message,
          senderId: this.userId,  // Assuming user exists, otherwise sender will be null
          channelId: channel.id,  // Use the dynamically fetched channel ID
          type: 'SENT',
        },
      });

      console.log('Message stored in DB:', messageRecord);

      return { success: true, data: response, messageRecord };
    } catch (error) {
      console.error('Error sending SMS or storing message:', error.message);
      throw new HttpException('Failed to send SMS or store message', HttpStatus.BAD_REQUEST);
    }
  }

  async sendMultipleSms(apiKey: string, data: MultipleSmsType[], campaignId: string): Promise<any> {
    try {
      const url = `${this.bulkSms}?API_KEY=${apiKey}`;
      const payload = {
        apiKey: apiKey,
        campaign_id: campaignId,
        messages: data,
      };

      return await this.makeRequest('POST', url, payload);
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      throw new HttpException('Failed to send SMS', HttpStatus.BAD_REQUEST);
    }
  }

  // Process incoming SMS and store the conversation and thread
  async processIncomingSms(receivedMessage: any): Promise<any> {
    try {
      const { sent_from, message } = receivedMessage;

      // 1. Find or create the channel (e.g., SMS)
      const channel = await this.prisma.channel.findFirst({
        where: { name: "Negarit" },
      });

      if (!channel) {
        throw new Error('Channel not found');
      }

      // 2. Check if the user (sender) already exists
      let user = await this.prisma.user.findUnique({
        where: { username: sent_from },
      });

      // 3. If the user doesn't exist, create the user
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            name: 'Default Name', // You can set a default name or handle this based on your logic
            username: `${sent_from}`, // You can customize the username
          },
        });
      }

      // 4. Create a mentee for the user
      let mentee = await this.prisma.mentee.findUnique({
        where: { userId: user.id },
      });

      if (!mentee) {
        mentee = await this.prisma.mentee.create({
          data: {
            userId: user.id,
            metadata: {}, // Add any default metadata if needed
          },
        });
      }

      // 5. Create a new message entry
      const newMessage = await this.prisma.message.create({
        data: {
          content: message,
          senderId: user.id,
          channelId: channel.id,
          type: 'RECEIVED',
        },
      });

      // 6. Create a conversation (or associate it if already exists)
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          channelId: channel.id,
          isActive: true,
        },
      });

      if (conversation) {
        // 7. If conversation exists, add message to the thread
        await this.prisma.thread.create({
          data: {
            conversationId: conversation.id,
            messageId: newMessage.id,
          },
        });
      } else {
        // 8. If no conversation exists, create one
        // Retrieve the mentorId from the database
        console.log('User ID:', this.userId);
        const mentor = await this.prisma.mentor.findUnique({
          where: { userId: this.userId }, // Use the userId from the decoded token
        });

        if (!mentor) {
          throw new Error('Mentor not found');
        }

        const newConversation = await this.prisma.conversation.create({
          data: {
            channelId: channel.id,
            mentorId: mentor.id,  // Use the retrieved mentorId
            menteeId: mentee.id,  // Use the mentee created in the 4th step
            isActive: true,
          },
        });

        // 9. Create thread for the new conversation
        await this.prisma.thread.create({
          data: {
            conversationId: newConversation.id,
            messageId: newMessage.id,
          },
        });
      }

      return { success: true, message: 'Message received and processed' };
    } catch (error) {
      console.error('Error processing incoming SMS:', error);
      throw new HttpException('Error processing SMS', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}