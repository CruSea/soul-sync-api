import { IsString, IsJSON, IsBoolean } from 'class-validator';

export class UpdateChannelDto {
  @IsString()
  name: string;
  @IsJSON()
  metadata: JSON;
  @IsJSON()
  configuration: JSON;
  @IsBoolean()
  isDeleted: boolean;
}
