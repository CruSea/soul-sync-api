import { Expose } from 'class-transformer';
import {Prisma} from '@prisma/client'

export class ChannelDto {
  @Expose()
  id: string;

  @Expose()
  accountId: string;
 
  @Expose()
  name: string;

  @Expose()
  configuration: Prisma.JsonValue;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ChannelDto>) {
    this.id = partial.id;
    this.accountId = partial.accountId;
    this.name = partial.name;
    this.configuration = partial.configuration;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
  }
}
