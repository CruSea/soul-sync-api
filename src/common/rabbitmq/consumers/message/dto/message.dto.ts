import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';

export enum MessageType {
  RECEIVED = 'RECEIVED',
}

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsDateString()
  @IsNotEmpty()
  createdAt: string;
}
