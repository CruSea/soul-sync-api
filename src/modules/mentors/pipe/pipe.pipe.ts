import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PipePipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}
