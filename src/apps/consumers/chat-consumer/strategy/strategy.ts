import { Payload } from '@nestjs/microservices';
export interface Strategy { 
    send(Payload: any)
}