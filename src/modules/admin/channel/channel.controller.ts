import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { GetChannelDto } from './dto/get-channel.dto';
import { Roles } from 'src/modules/auth/auth.decorator';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';

@Controller('admin/channel')
@UseGuards(AuthGuard)
@Roles('OWNER')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(createChannelDto);
  }

  @Post(':id/connect')
  connect(@Param('id') id: string) {
    return this.channelService.connect(id);
  }

  @Post(':id/connect-negarit')
  connectNegarit(@Param('id') id: string) {
    return this.channelService.connectNegarit(id);
  }

  @Get()
  findAll(@Query() getChannel: GetChannelDto) {
    return this.channelService.findAll(getChannel);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() getChannel: GetChannelDto) {
    return this.channelService.findOne(id, getChannel);
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
