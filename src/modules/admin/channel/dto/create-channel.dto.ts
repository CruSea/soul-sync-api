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
