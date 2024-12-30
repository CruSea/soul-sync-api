import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AuthGuard } from'src/modules/auth/guard/auth/auth.guard';
import { Roles } from'src/modules/auth/auth.decorator';
import { extractAccountId } from './utility/exractId';
import { PrismaService } from'src/modules/prisma/prisma.service';
import { TelegramChannelService } from './telegramchannel.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Controller('channel')
@UseGuards(AuthGuard)
@Roles('OWNER')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly telegramChannelService: TelegramChannelService,
  ) {}

  @Post('createChannel')
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(createChannelDto);
  }

  @Post('telegram')
  async handleIncoming(@Headers('Authorization') authHeader: string, @Body('telegramToken') telegramToken: string, @Body('metaData') metaData: string) {
    
    const token = authHeader.replace('Bearer ', '');
    const payload = this.jwtService.decode(token);

      
    try {
      const { accountId } = await extractAccountId(payload.id, this.prisma);
      if (!accountId) {
        throw new NotFoundException('No accountId provided');
      }
      const decoded = await this.telegramChannelService.extractFromToken(telegramToken, accountId);
      console.log("decoded: ", decoded);
      await axios.post('http://localhost:3000/channel/createChannel', 
        {
          name: String(decoded.name),
          username: String(decoded.username),
          accountId: String(accountId),
          configuration: typeof decoded.configuration === 'string'
            ? decoded.configuration
            : JSON.stringify(decoded.configuration),
            metaData: typeof metaData === 'string' ? metaData : JSON.stringify(metaData),
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      )
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
      

    } catch (error) {
      console.error(error);
      throw error; 
    }
  }
  
  @Post('create')
  async CreateChannelDto(
    @Headers('Authorization') authHeader: string, 
    @Body() channelDetails: any
  ) {
    const token = authHeader.replace('Bearer ', '').trim(); // Ensure whitespace is trimmed
    if (channelDetails.metaData.channelType === 'Telegram Bot') { // Safe navigation for metaData
      try {
        const response = await axios.post('http://localhost:3000/channel/telegram',
          {
            "telegramToken": String(channelDetails.metaData.channelToken), 
            "metaData": channelDetails.metaData
          },
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        return {message: 'Telegram Bot channel created successfully' };
      } catch (error) {
        console.error('Error in Telegram Bot request:', error);
        throw new Error('Error creating Telegram Bot channel');
      }
      
    }
  }
  

  @Get('test')
  async decodeToken(@Headers('Authorization') authHeader: string) {
    const token = authHeader.replace('Bearer ', '');
    const payload = this.jwtService.decode(token);
    const { accountId } = await extractAccountId(payload.id, this.prisma);
    return {payload, accountId};
  }
}