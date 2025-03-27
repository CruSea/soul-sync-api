import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  imageUrl: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  roles?: string[];

  constructor(partial: Partial<UserDto>) {
    this.id = partial.id;
    this.name = partial.name;
    this.email = partial.email;
    this.imageUrl = partial.imageUrl;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
  }
}
