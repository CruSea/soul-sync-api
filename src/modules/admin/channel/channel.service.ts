import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Channel } from './entities/channel.entity';
import { GetChannelDto } from './dto/get-channel.dto';

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

  async findAll(getChannel: GetChannelDto): Promise<Channel[]> {
    const channels = await this.prisma.channel.findMany({
      where: { accountId: getChannel.accountId, deletedAt: null },
    });

    return channels.map((channel) => Channel.create(channel));
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
