import { Expose } from 'class-transformer';

export class RoleDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  accountId: string;

  constructor(partial: Partial<RoleDto>) {
    Object.assign(this, {
      id: partial.id,
      name: partial.name,
      accountId: partial.accountId,
    });
  }
}
