import { Prisma } from '@prisma/client';
import { IsJSON, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsString()
  accountId: string;

  @IsJSON()
  metaData: Prisma.InputJsonValue;

  @IsJSON()
  configuration: Prisma.InputJsonValue;
}
