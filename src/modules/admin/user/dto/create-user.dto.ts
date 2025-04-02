import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  accountId: string;
  @IsString()
  roleId: string;
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @IsOptional()
  password: string;
}
