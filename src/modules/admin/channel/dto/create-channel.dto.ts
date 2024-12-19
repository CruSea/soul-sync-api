import { Prisma } from '@prisma/client';
import { IsJSON, IsString, IsOptional } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsOptional()
  accountId: string;
  @IsString()
  name: string;
  @IsJSON()
  metadata: Prisma.JsonValue;
  @IsJSON()
  configuration: Prisma.JsonValue;
}
