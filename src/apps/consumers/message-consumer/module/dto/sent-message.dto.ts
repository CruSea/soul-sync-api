import { MessageType } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class SentMessageDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  type: MessageType;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  createdAt: string;
}
