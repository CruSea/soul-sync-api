import {
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { GenderType } from '@prisma/client';

export class UpdateMentorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  availability?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsEnum(GenderType)
  gender?: GenderType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
