import { Injectable } from "@nestjs/common";
import { Strategy } from "./strategy";


@Injectable()
export class ClientService {
  private strategy: Strategy;
}