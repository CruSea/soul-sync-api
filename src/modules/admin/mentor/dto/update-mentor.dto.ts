import {
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
  IsObject,
  ArrayNotEmpty,
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
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  expertise?: string[];

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
