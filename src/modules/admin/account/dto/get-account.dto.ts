import { IsOptional } from 'class-validator';

export class GetAccountDto {
  @IsOptional()
  userId: string;
}
