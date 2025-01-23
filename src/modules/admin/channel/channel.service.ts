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
      data: {
        name: createChannelDto.name,
        type: createChannelDto.type as unknown as import('@prisma/client').$Enums.ChannelType,
        configuration: createChannelDto.configuration,
        accountId: createChannelDto.accountId,
      },
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

  async disconnect(
    id: string,
  ): Promise<{ ok: boolean; result: boolean; description: string }> {
    const channel = await this.prisma.channel.findFirst({
      where: { id, type: 'TELEGRAM' },
    });

    if (!channel) {
      throw new HttpException('Channel not found', 404);
    }

    const token = (channel.configuration as any)?.token;

    if (!token) {
      throw new HttpException('Invalid Telegram configuration', 400);
    }

    const resp = await fetch(
      'https://api.telegram.org/bot' + token + '/deleteWebhook',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!resp.ok) {
      throw new HttpException(
        `Failed to disconnect: ${resp.statusText}`,
        resp.status,
      );
    }

    return {
      ok: true,
      result: false,
      description: 'Webhook was disconnected',
    };
  }

  async connectNegarit(id: string): Promise<{ success: string }> {
    const channel = await this.prisma.channel.findFirst({
      where: { id, type: 'NEGARIT' },
    });

    if (channel) {
      const success = `Please add this URL to your Negarit admin dashboard webhook URL field: ${process.env.HOST_URL + '/message/negarit?id=' + channel.id}`;
      return { success };
    }

    throw new HttpException('Channel not found', 404);
  }

  async connectTwilio(id: string): Promise<{ webhookUrl: string }> {
    const channel = await this.prisma.channel.findFirst({
      where: { id, type: 'TWILIO' },
    });

    if (channel) {
      const accountSid = (channel.configuration as any)?.accountSid;
      const authToken = (channel.configuration as any)?.authToken;
      const webhookUrl = `${process.env.HOST_URL}/message/twilio?id=${channel.id}`;

      if (!accountSid || !authToken) {
        throw new HttpException('Invalid Twilio configuration', 400);
      }

      return { webhookUrl };
    }

    throw new HttpException('Channel not found', 404);
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
      data: {
        name: updateChannelDto.name,
        configuration: updateChannelDto.configuration,
      },
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
