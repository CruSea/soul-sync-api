import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@prisma/client';

export const ROLE_KEY = 'roles';
export const Roles = (...args: [RoleType, ...RoleType[]]) =>
  SetMetadata(ROLE_KEY, args);
