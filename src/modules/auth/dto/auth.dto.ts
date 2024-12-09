// src/posts/dto/post.dto.ts

import { Expose, Type } from 'class-transformer';
import { UserDto } from 'src/modules/admin/user/dto/user.dto';

export class AuthDto {
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  token: string;

  constructor(partial: Partial<AuthDto>) {
    Object.assign(this, partial);
  }
}
