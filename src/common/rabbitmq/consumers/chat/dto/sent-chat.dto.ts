import { IsNotEmpty, IsString } from 'class-validator';

export class SentChatDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  channelId: string;

  @IsNotEmpty()
  channelConfig: Record<string, any>;
}
