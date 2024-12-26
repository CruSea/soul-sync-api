import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  username: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  imageUrl:  String
  
  @Expose()
  isDeleted: Boolean
  
  roles: string[];

  constructor(partial: Partial<UserDto>) {
    this.id = partial.id;
    this.name = partial.name;
    this.username = partial.username;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
  }
}
