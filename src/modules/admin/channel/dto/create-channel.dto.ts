import { Prisma } from '@prisma/client';
import { IsJSON, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  accountId: string;

  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsJSON()
  configuration: Prisma.JsonValue;
}
