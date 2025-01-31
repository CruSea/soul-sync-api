// src/posts/dto/post.dto.ts

import { Expose, Type } from 'class-transformer';
import { UserDto } from 'src/modules/admin/user/dto/user.dto';

export class MentorDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserDto)
  user?: UserDto;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  age?: number;

  @Expose()
  location?: string;

  @Expose()
  gender?: string;

  @Expose()
  expertise?: any;

  @Expose()
  availability?: any;

  @Expose()
  isActive?: any;

  constructor(partial: Partial<MentorDto>) {
    console.log('partial', partial);
    Object.assign(this, {
      id: partial.id,
      name: partial.name,
      email: partial.email,
      expertise: partial.expertise,
      availability: partial.availability,
      age: partial.age,
      gender: partial.gender,
      location: partial.location,
      isActive: partial.isActive,
      user: partial.user ? new UserDto(partial.user) : null,
    });
  }
}
