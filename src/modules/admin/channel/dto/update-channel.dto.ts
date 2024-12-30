import { IsString, IsJSON } from 'class-validator';
import { Prisma } from '@prisma/client';

export class UpdateChannelDto {
  @IsString()
  name: string;

  @IsString()
  username: string;
  
  @IsJSON()
  metaData: Prisma.InputJsonValue;

  @IsJSON()
  configuration: Prisma.JsonValue;
}
