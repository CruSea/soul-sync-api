import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class SignUpUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
