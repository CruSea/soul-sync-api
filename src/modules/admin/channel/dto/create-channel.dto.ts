import { Prisma } from '@prisma/client';
import { IsJSON, IsString, IsOptional } from 'class-validator';

export class CreateChannelDto {
  @IsOptional()
  accountId: string;

  @IsString()
  name: string;

  @IsJSON()
  configuration: Prisma.JsonValue;
}
