import { IsString, IsOptional } from 'class-validator';

export class RabbitMQConnectionDto {
  @IsOptional()
  @IsString()
  QueueName?: string;

  @IsOptional()
  @IsString()
  RoutingKey?: string;

  @IsOptional()
  @IsString()
  ExchangeName?: string;

  @IsOptional()
  @IsString()
  ExchangeType?: string;
}
