import { IsString, IsEnum } from 'class-validator';
import { MessageType } from '@prisma/client';

export class CreateMessageDto {
  @IsString()
  channelId: string;

  @IsString()
  address: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  body: string;
}
