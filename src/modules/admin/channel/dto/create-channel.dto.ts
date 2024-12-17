import { Prisma } from '@prisma/client';
import { IsJSON, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateChannelDto {
  /*@IsString()
  id: string; */
  @IsString()
  @IsOptional()
  accountId: string;
  @IsString()
  name: string;
  @IsJSON()
  metadata: Prisma.JsonValue;
  @IsJSON()
  configuration: Prisma.JsonValue;
  @IsBoolean()
  isDeleted: boolean;
  /*@IsString()
  account: string;*/
}
