import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NegaritService } from './negarit.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Controller('negarit')
export class NegaritController {
  constructor(private readonly negaritService: NegaritService,
    private readonly prisma: PrismaService,
  ) { }

  @Post('send-sms')
  async sendSms(
    @Body('apiKey') apiKey: string,
    @Body('sentTo') sentTo: string,
    @Body('message') message: string,
    @Body('campaignId') campaignId: string,
  ) {
    try {
      return await this.negaritService.sendSms(apiKey, sentTo, message, campaignId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('receive')
  async receiveSms(@Body() body: any) {
    try {
      const { received_message } = body;

      // 1. Find or create the channel (e.g., SMS)
      const channel = await this.prisma.channel.findFirst({
        where: { name: "Negarit" },
      });

      if (!channel) {
        throw new Error('Channel not found');
      }

      // 2. Check if the user (sender) already exists
      let user = await this.prisma.user.findUnique({
        where: { username: received_message.sent_from },
      });

      // 3. If the user doesn't exist, create the user
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            name: 'Default Name', // You can set a default name or handle this based on your logic
            username: `${received_message.sent_from}`, // You can customize the username
            //phone: received_message.sent_from,
          },
        });

        console.log('Created new user:', user);
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

        console.log('Created new mentee:', mentee);
      }

      // 5. Create a new message entry
      const newMessage = await this.prisma.message.create({
        data: {
          content: received_message.message,
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
        const newConversation = await this.prisma.conversation.create({
          data: {
            channelId: channel.id,
            mentorId: '214ab770-3448-4d2b-868f-17d3243257c3',  // Add logic to find or create mentor
            menteeId: mentee.id,     // Use the menteeId to associate with the conversation
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

/*       // Optionally, respond back to the sender
      const replyMessage = 'Thanks for reaching out!';
      await this.negaritService.sendSms(user.username, replyMessage);  // assuming username is the phone number
 */
      return { success: true, message: 'Message received and processed' };
    } catch (error) {
      console.error('Error processing incoming SMS:', error);
      throw new HttpException('Error processing SMS', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
