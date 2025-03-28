import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate, PaginationResult } from 'src/common/helpers/pagination';
import { Message } from '@prisma/client';

type MessageWithChannel = Message & {
  Channel: {
    name: string;
    type: string;
  };
};

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllMessages(
    accountId: string,
    query: Record<string, any>,
  ): Promise<PaginationResult<Message>> {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const accountExists = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!accountExists) {
      throw new Error('Account does not exist');
    }

    const paginationDto = new PaginationDto();
    paginationDto.page = query.page ? parseInt(query.page) : 1;
    paginationDto.limit = query.limit ? parseInt(query.limit) : 10;

    const where: any = {
      Channel: {
        accountId: accountId,
      },
    };

    const result = await paginate<MessageWithChannel>(
      this.prisma,
      this.prisma.message,
      where,
      paginationDto.page,
      paginationDto.limit,
      {
        Channel: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    );

    const transformedData = result.data.map((message) => {
      const { Channel, ...rest } = message;
      return {
        ...rest,
        name: Channel.name,
        platform: Channel.type,
      };
    });

    return {
      ...result,
      data: transformedData,
    };
  }
}
