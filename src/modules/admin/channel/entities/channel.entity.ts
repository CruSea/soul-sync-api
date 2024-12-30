import { Prisma } from "@prisma/client";

export class Channel {
  id: string;
  name: string;
  username: string;
  metaData: Prisma.InputJsonValue;
  configuration: Prisma.JsonValue;
}
