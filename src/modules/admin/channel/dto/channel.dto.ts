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
  username: string;

  @Expose()
  metaData: Prisma.InputJsonValue;

  @Expose()
  configuration: Prisma.JsonValue;

  @Expose()
  isDeleted: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ChannelDto>) {
    this.id = partial.id;
    this.accountId = partial.accountId;
    this.name = partial.name;
    this.username = partial.username;
    this.metaData = partial.metaData;
    this.configuration = partial.configuration;
    this.isDeleted = partial.isDeleted;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
  }
}
