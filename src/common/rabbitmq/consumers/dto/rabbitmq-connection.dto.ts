import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class RabbitMQConnectionDto {
  @IsOptional()
  @IsString()
  queueName?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, {
    message: 'At least one routing key must be provided if specified.',
  })
  @IsString({ each: true, message: 'Each routing key must be a string.' })
  routingKeys?: string[];

  @IsOptional()
  @IsString()
  exchangeName?: string;

  @IsOptional()
  @IsString()
  exchangeType?: string;
}
