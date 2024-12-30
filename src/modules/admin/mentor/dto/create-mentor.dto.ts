import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMentorDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsString()
  @IsOptional()
  name: string;
}
