import { IsOptional, IsString, IsInt, IsObject } from 'class-validator';

class Availability {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}

export class UpdateMentorDto {
  @IsOptional()
  @IsString()
  expertise: string;

  @IsOptional()
  @IsObject()
  availability: Availability;

  @IsOptional()
  @IsInt()
  age: number;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  location: string;
}
