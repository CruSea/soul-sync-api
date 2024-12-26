import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name: string;
  @IsEmail()
  username: string;
  @IsString()
  password: string;
}
