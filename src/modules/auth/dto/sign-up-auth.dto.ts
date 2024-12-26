import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class SignUpUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
