import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  accountId: string;
  @IsString()
  roleId: string;
  @IsString()
  name: string;
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsString()
  imageUrl: string;
}
