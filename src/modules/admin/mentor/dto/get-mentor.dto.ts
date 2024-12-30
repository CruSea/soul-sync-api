import { IsNotEmpty, IsString } from 'class-validator';

export class GetMentorDto {
  @IsNotEmpty()
  @IsString()
  accountId: string;
}
