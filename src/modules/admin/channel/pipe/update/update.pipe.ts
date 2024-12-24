import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UpdateChannelDto } from '../../dto/update-channel.dto';

@Injectable()
export class UpdatePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: UpdateChannelDto, metadata: ArgumentMetadata) {

     // Validate the channel name
        if (!value.name || value.name.trim() === '') {
          throw new BadRequestException('Channel name is required');
        }
    
        // Validate the configuration
        if (!value.configuration || typeof value.configuration !== 'string' || value.configuration.trim() === '') {
          throw new BadRequestException('Configuration is required and must be a non-empty JSON string');
        }
    
        // Validate the metadata
        if (!value.metadata || typeof value.metadata !== 'string' || value.metadata.trim() === '') {
          throw new BadRequestException('Metadata is required and must be a non-empty JSON string');
        }
    
        // Parse the JSON strings to ensure they are valid JSON
        try {
          value.configuration = JSON.parse(value.configuration);
        } catch (error) {
          throw new BadRequestException('Configuration must be a valid JSON string');
        }
    
        try {
          value.metadata = JSON.parse(value.metadata);
        } catch (error) {
          throw new BadRequestException('Metadata must be a valid JSON string');
        }
        
    return value;
  }

  
}
