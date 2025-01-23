import { MessageDto } from "../dto/message.dto";

export interface MessageTransmitterValidator {
    supports(type: string): boolean;
    extractAdress(): string | null;
    validate(message: any): MessageDto | null;
}