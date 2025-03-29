import {
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsObject,
  Min,
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
  @IsObject()
  expertise?: Record<string, string>;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsObject()
  availability?: Record<string, string[]>;

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
