import { Body, Controller, Post, Headers } from '@nestjs/common';
import { PlatformService } from './platform.service';

@Controller('Platform')
export class PlatformController {
  constructor(private readonly PlatformService: PlatformService) {}

  @Post('create')
  async CreateChannelDto(
    @Headers('Authorization') authHeader: string,
    @Body() channelDetails: any,
  ) {
    this.PlatformService.create(authHeader, channelDetails);
  }
}
