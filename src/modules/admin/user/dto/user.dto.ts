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
  role?: string;

  @Expose()
  status?: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    this.id = partial.id;
    this.name = partial.name;
    this.email = partial.email;
    this.imageUrl = partial.imageUrl;
    this.role = partial.role;
    this.status = partial.status;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
  }
}
