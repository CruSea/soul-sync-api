import { Module } from "@nestjs/common";
import { TelegramService } from "./telegram.service";

@Module({})
export class TelegramModule {
    providers: [TelegramService];
    exports: [TelegramService];
}