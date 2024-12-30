/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { ChannelDto } from './dto/channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) { }

  async create(createChannelDto: CreateChannelDto) {
    const channelData = await this.prisma.channel.create({
      data: {
        name: createChannelDto.name,
        username: createChannelDto.username,
        accountId: createChannelDto.accountId,
        configuration: typeof createChannelDto.configuration === 'string'
          ? JSON.parse(createChannelDto.configuration)
          : createChannelDto.configuration,
        metaData: typeof createChannelDto.metaData === 'string' 
        ? JSON.parse(createChannelDto.metaData) 
        : createChannelDto.metaData
      }
    });

    return new ChannelDto(channelData);
  }
}
