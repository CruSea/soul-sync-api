import { IsString, IsJSON } from 'class-validator';
import { Prisma } from '@prisma/client';

export class UpdateChannelDto {
  @IsString()
  name: string;
  @IsJSON()
  metadata: Prisma.JsonValue;
  @IsJSON()
  configuration: Prisma.JsonValue;
}
