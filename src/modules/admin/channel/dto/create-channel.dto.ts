import { ChannelType } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;
  @IsNotEmpty()
  type: ChannelType;

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  configuration?: Record<string, any>;
}
