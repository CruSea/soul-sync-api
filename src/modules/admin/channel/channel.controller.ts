import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CreateChannelPipe } from './pipe/create/create.pipe';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { Roles } from 'src/modules/auth/auth.decorator';
import { extractAccountIdFromToken } from './utility/exractId';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Controller('admin/channel')
@UseGuards(AuthGuard)
@Roles('ADMIN')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  @Post()
  @UsePipes(CreateChannelPipe)
  create(@Body() createChannelDto: CreateChannelDto, @Req() request: any) {
    return this.channelService.create(createChannelDto, request.accountId);
  }

  @Get()
  async findAll(@Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    const { accountId } = await extractAccountIdFromToken(token, this.jwtService, this.prisma);

    if (!accountId) {
      throw new NotFoundException('No accountId provided');
    }
    return this.channelService.findAll(accountId);
  }


  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: any) {
    const token = request.headers.authorization?.split(' ')[1];
    const { accountId } = await extractAccountIdFromToken(token, this.jwtService, this.prisma);

    if (!accountId) {
      throw new NotFoundException('No accountId provided');
    }

    const channel = await this.channelService.findOne(id, accountId);

    if (channel.accountId !== accountId) {
      throw new NotFoundException('Channel not found for this account');
    }

    return channel;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelService.update(id, updateChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelService.remove(id);
  }
}
