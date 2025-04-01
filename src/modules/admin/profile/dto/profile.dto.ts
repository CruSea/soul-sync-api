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
  role: string;

  constructor(partial: Partial<ProfileDto>) {
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
