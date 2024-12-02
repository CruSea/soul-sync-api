import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAllByUser(userId: string): Promise<Message[]> {
    return this.databaseService.message.findMany({
      where: {
        from_address: userId,
        isDeleted: false,
      },
    });
  }

  async create(createMessageDto: { to_address: string; body: string }, userId: string): Promise<Message> {
    // Hardcoded channel ID
    const channelId = "channel_id"; // Replace with your actual channel ID

    // Validate required fields
    const { to_address, body } = createMessageDto;

    if (!to_address || !body) {
      throw new BadRequestException('Both recipient address and message body must be provided.');
    }

    // Check if the recipient exists
    const recipientExists = await this.databaseService.account.findUnique({
      where: { uuid: to_address },
    });

    if (!recipientExists) {
      throw new NotFoundException('Recipient account not found');
    }

    // Create the message
    return this.databaseService.message.create({
      data: {
        channel_id: channelId,
        from_address: userId, // Automatically filled with the creator's UUID
        to_address,
        body,
        isDeleted: false, // Default value for isDeleted
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Message> {
    const message = await this.databaseService.message.findUnique({ where: { uuid: id } });
    
    if (!message || message.from_address !== userId || message.isDeleted) {
      throw new NotFoundException('Message not found or access denied');
    }
    
    return message;
  }

  async update(id: string, updateMessageDto: Prisma.MessageUpdateInput, userId: string): Promise<Message> {
    const message = await this.databaseService.message.findUnique({ where: { uuid: id } });
    
    if (!message || message.from_address !== userId || message.isDeleted) {
      throw new NotFoundException('Message not found or access denied');
    }
    
    return this.databaseService.message.update({
      where: { uuid: id },
      data: updateMessageDto,
    });
  }

  async remove(id: string, userId: string): Promise<Message> {
    const message = await this.databaseService.message.findUnique({ where: { uuid: id } });
    
    if (!message || message.from_address !== userId || message.isDeleted) {
      throw new NotFoundException('Message not found or access denied');
    }
    
    return this.databaseService.message.update({
      where: { uuid: id },
      data: { isDeleted: true },
    });
  }
}