// src/posts/dto/post.dto.ts

import { ro } from '@faker-js/faker/.';
import { Expose } from 'class-transformer';

export class ProfileDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  isActive: boolean;

  @Expose()
  AccountUser: any;

  @Expose()
  role: string; // Add the roleName field

  constructor(partial: Partial<ProfileDto>) {
    // console.log('partial', partial);
    Object.assign(this, {
      id: partial.id,
      name: partial.name,
      email: partial.email,
      //role: partial.AccountUser.Role.name,
      isActive: partial.isActive,
      AccountUser: partial.AccountUser,
    });
  }
}
