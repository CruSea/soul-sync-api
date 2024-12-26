import {
  IsOptional,
  IsString,
  IsInt,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class Time {
  @IsString()
  hour: string;

  @IsString()
  minute: string;

  @IsString()
  dayPeriod: string;
}

class DayAvailability {
  @ValidateNested()
  @Type(() => Time)
  startTime: Time;

  @ValidateNested()
  @Type(() => Time)
  endTime: Time;
}

class Availability {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DayAvailability)
  monday?: DayAvailability;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DayAvailability)
  tuesday?: DayAvailability;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DayAvailability)
  wednesday?: DayAvailability;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DayAvailability)
  thursday?: DayAvailability;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DayAvailability)
  friday?: DayAvailability;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DayAvailability)
  saturday?: DayAvailability;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DayAvailability)
  sunday?: DayAvailability;
}

export class UpdateMentorDto {
  @IsOptional()
  @IsInt()
  age: number;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  expertise: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Availability)
  availability: Availability;
}
