import { IsString, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  domain: string | null;
}
