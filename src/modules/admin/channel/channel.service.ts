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
  ) {}

  async create(createChannelDto: CreateChannelDto) {
    const channelData = await this.prisma.channel.create({
      data: {
        name: createChannelDto.name,
        accountId: createChannelDto.accountId,
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

  async findAll(): Promise<ChannelDto[]> {
    const channels = await this.prisma.channel.findMany();
    return channels.map((channel) => new ChannelDto(channel));
  }

  async findOne(id: string): Promise<ChannelDto> {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
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
    const channel = await this.prisma.channel.update({
      where: { id },
      data: {
        name: updateChannelDto.name,
      },
    });
    if (!channel) {
      throw new NotFoundException(`Channel with id ${id} not found`);
    }
    return new ChannelDto(channel);
  }

  async remove(id: string): Promise<void> {
    const channel = await this.prisma.channel.delete({
      where: { id },
    });
    if (!channel) {
      throw new NotFoundException(`Channel with id ${id} not found`);
    }
  }
}
