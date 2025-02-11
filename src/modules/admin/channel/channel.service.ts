import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Channel } from './entities/channel.entity';
import { GetChannelDto } from './dto/get-channel.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate, PaginationResult } from 'src/common/helpers/pagination';


@Injectable()
export class ChannelService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}

  async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    const channel = await this.prisma.channel.create({
      data: createChannelDto,
    });

    return Channel.create(channel);
  }

  async connect(id: string): Promise<Channel> {
    const channel = await this.prisma.channel.findFirst({
      where: { id, type: 'TELEGRAM' },
    });

    if (channel) {
      const token = (channel.configuration as any)?.token;
      const resp = await fetch(
        'https://api.telegram.org/bot' + token + '/setWebhook',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: process.env.HOST_URL + '/message/telegram?id=' + channel.id,
          }),
        },
      );

      if (!resp.ok) {
        throw new HttpException(resp.body, resp.status);
      }

      return resp.json();
    }

    return Channel.create(channel);
  }

  async findAll(
    query: Record<string, any>,
  ): Promise<PaginationResult<GetChannelDto>> {
    const getChannelDto = new GetChannelDto();
    getChannelDto.accountId = query.accountId;

    const paginationDto = new PaginationDto();
    paginationDto.page = query.page ? parseInt(query.page) : 1;
    paginationDto.limit = query.limit ? parseInt(query.limit) : 10;

    return paginate(
      this.prisma,
      this.prisma.channel,
      { accountId: getChannelDto.accountId, deletedAt: null },
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async findOne(id: string, getChannel: GetChannelDto): Promise<Channel> {
    const channel = await this.prisma.channel.findFirst({
      where: { id, accountId: getChannel.accountId, deletedAt: null },
    });

    return Channel.create(channel);
  }

  async update(id: string, updateChannelDto: UpdateChannelDto) {
    const channel = await this.prisma.channel.update({
      where: { id },
      data: updateChannelDto,
    });

    return Channel.create(channel);
  }

  async remove(id: string): Promise<{ status: boolean }> {
    const channel = await this.prisma.channel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { status: channel ? true : false };
  }
}
