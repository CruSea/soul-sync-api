import { isBoolean, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name: string;
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsString()
  imageUrl: string;
  isDeleted: boolean;
}
