/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { ChannelDto } from './dto/channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) { }

  async create(createChannelDto: CreateChannelDto, accountId: any) {
    const channelData = await this.prisma.channel.create({
      data: {
        name: createChannelDto.name,
        accountId: accountId,
        metadata:
          typeof createChannelDto.metadata === 'string'
            ? JSON.parse(createChannelDto.metadata)
            : createChannelDto.metadata,
        configuration:
          typeof createChannelDto.configuration === 'string'
            ? JSON.parse(createChannelDto.configuration)
            : createChannelDto.configuration,
        isDeleted: false,
      },
    });

    return new ChannelDto(channelData);
  }

  async findAll(accountId: string): Promise<ChannelDto[]> {
    if (!accountId) {
      throw new Error('accountId is required');
    }
    const channels = await this.prisma.channel.findMany({
      where: {
        accountId: accountId,
        isDeleted: false,
      }
    });
    return channels.map((channel) => new ChannelDto(channel));
  }

  async findOne(id: string, accountId: string): Promise<ChannelDto> {
    const channel = await this.prisma.channel.findFirst({
      where: {
        id,
        accountId,
        isDeleted: false,
      },
    });
    if (!channel) {
      throw new NotFoundException(`Channel with id ${id} not found`);
    }
    return new ChannelDto(channel);
  }

  async update(
    id: string,
    updateChannelDto: UpdateChannelDto,
  ): Promise<ChannelDto> {

    try {
      const channel = await this.prisma.channel.update({
        where: { id },
        data: {
          name: updateChannelDto.name,
          metadata:
            typeof updateChannelDto.metadata === 'string'
              ? JSON.parse(updateChannelDto.metadata)
              : updateChannelDto.metadata,
          configuration:
            typeof updateChannelDto.configuration === 'string'
              ? JSON.parse(updateChannelDto.configuration)
              : updateChannelDto.configuration,
          isDeleted: false,
        },
      });
      if (!channel) {
        throw new NotFoundException(`Channel with id ${id} not found`);
      }
      return new ChannelDto(channel);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Channel with id ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const channel = await this.prisma.channel.update({
      where: { id },
      data: { isDeleted: true },
    });
    if (!channel) {
      throw new NotFoundException(`Channel with id ${id} not found`);
    }

    return { message: 'Channel deleted successfully' };
  }

}
