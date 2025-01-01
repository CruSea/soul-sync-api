import { IsString } from 'class-validator';

export class NegaritMessageDto {
  @IsString()
  message: string;

  @IsString()
  phone: string;
}
