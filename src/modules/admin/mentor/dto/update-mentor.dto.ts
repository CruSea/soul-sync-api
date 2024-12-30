import { IsEmail, IsOptional } from 'class-validator';

export class UpdateMentorDto {
  @IsEmail()
  @IsOptional()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string;
}
