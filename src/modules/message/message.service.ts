import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MessageStrategyResolver } from './strategy/strategy';

@Injectable()
export class MessageService {
  constructor(
    private readonly strategyResolver: MessageStrategyResolver,
    private readonly prisma: PrismaService,
  ) {}

  async processMessage(id: string, message: any) {
    try {
      const channel = await this.prisma.channel.findUnique({
        where: { id },
      });

      if (!channel) {
        throw new HttpException(`Channel with ID ${id} not found`, 404);
      }
      const strategy = this.strategyResolver.resolve(channel.type);
      return await strategy.processMessage(id, message);
    } catch (error) {
      throw new HttpException('Failed to process message', 500);
    }
  }
}
