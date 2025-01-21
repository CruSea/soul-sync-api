import { CreateMessageDto } from "./dto/create-message.dto";

export interface MessageValidator {
  supports(type: string): boolean;
  validate(message: any): CreateMessageDto | null;
}
