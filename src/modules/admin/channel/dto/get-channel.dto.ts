import { IsNotEmpty, IsString } from 'class-validator';

export class GetChannelDto {
  @IsNotEmpty()
  @IsString()
  accountId: string;
}
