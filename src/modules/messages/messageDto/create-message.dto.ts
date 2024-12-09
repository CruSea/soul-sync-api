import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  channelId: string;

  @IsNotEmpty()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  body: string;
}