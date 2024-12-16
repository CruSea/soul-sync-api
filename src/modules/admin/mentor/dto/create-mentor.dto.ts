import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateMentorDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
