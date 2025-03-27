// src/posts/dto/post.dto.ts

import { Expose } from 'class-transformer';

export class AdminDto {
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
  roleName: string; // Add the roleName field

  constructor(partial: Partial<AdminDto>) {
   // console.log('partial', partial);
    Object.assign(this, {
      id: partial.id,
      name: partial.name,
      email: partial.email,
      isActive: partial.isActive,
      AccountUser: partial.AccountUser
    });
  }
}

