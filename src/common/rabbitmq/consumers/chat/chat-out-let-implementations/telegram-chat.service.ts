import { Injectable } from "@nestjs/common";
import { SendChatInterface } from "./send-chat.interface";

@Injectable()
export class TelegramMessageValidator implements SendChatInterface {}