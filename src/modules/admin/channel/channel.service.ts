import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Channel } from './entities/channel.entity';
import { GetChannelDto } from './dto/get-channel.dto';
import { ChannelFactory } from './channel-platforms/channel-factory';
@Injectable()
export class ChannelService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
    private strategyFactory: ChannelFactory,
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

  async connect(
    id: string,
  ): Promise<{ ok: boolean; result: boolean; description: string }> {
    try {
      const channel = await this.prisma.channel.findFirst({ where: { id } });

      if (!channel) {
        throw new HttpException('Channel not found', 404);
      }

      const strategy = this.strategyFactory.getStrategy(channel.type);
      const result = await strategy.connect(channel);

      await this.prisma.channel.update({
        where: { id },
        data: { is_on: true },
      });

      return result;
    } catch (error) {
      console.error('Error in connect method:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to connect channel', 500);
    }
  }

  async disconnect(
    id: string,
  ): Promise<{ ok: boolean; result: boolean; description: string }> {
    try {
      const channel = await this.prisma.channel.findFirst({ where: { id } });

      if (!channel) {
        throw new HttpException('Channel not found', 404);
      }

      const strategy = this.strategyFactory.getStrategy(channel.type);
      const result = await strategy.disconnect(channel);

      await this.prisma.channel.update({
        where: { id },
        data: { is_on: false },
      });

      return result;
    } catch (error) {
      console.error('Error in disconnect method:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to disconnect channel', 500);
    }
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
