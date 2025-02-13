import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate, PaginationResult } from 'src/common/helpers/pagination';
import { Message } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllMessages(
    accountId: string,
    query: Record<string, any>,
  ): Promise<PaginationResult<Message>> {
    const paginationDto = new PaginationDto();
    paginationDto.page = query.page ? parseInt(query.page) : 1;
    paginationDto.limit = query.limit ? parseInt(query.limit) : 10;

    const where: any = {
      Channel: {
        accountId: accountId,
      },
    };

    return paginate<Message>(
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
  }
}
