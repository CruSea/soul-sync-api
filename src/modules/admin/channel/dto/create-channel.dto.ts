import { ChannelType } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum ChannelType {
  NEGARIT,
  TELEGRAM,
  WHATSAPP,
  TWILIO,
}

export class CreateChannelDto {
  @IsString()
  name: string;

  type: ChannelType;

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  type: ChannelType;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  configuration?: Record<string, any>;
}
