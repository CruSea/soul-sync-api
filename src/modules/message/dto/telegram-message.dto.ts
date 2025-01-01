import { IsOptional } from 'class-validator';

export class TelegramMessageDto {
  @IsOptional()
  message: any;

  @IsOptional()
  phone: string;
}
