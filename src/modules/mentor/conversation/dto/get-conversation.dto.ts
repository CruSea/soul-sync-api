import { IsNotEmpty, IsString } from 'class-validator';

export class GetConversationDto {
  @IsNotEmpty()
  @IsString()
  accountId: string;
}
