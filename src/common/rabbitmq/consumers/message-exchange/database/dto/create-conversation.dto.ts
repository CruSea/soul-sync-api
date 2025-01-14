import { IsBoolean, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  mentorId: string;

  @IsString()
  address: string;

  channelId: string;

  @IsBoolean()
  isActive: boolean;
}
