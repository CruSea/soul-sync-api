import { IsString } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  conversationId: string;

  @IsString()
  messageId: string;
}
