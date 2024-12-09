import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  userId: string;
  @IsString()
  accountId: string;
  @IsString()
  name: string;
  @IsEmail()
  email: string;
}
