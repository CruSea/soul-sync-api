import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UpdatePipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}
