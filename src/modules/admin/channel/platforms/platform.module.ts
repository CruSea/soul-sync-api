import { Module } from "@nestjs/common";
import { PlatformController } from "./platform.controller";
import { PlatformService } from "./platform.service";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { TelegramModule } from "./telegram/telegram.module";
import { NegaritModule } from "./negarit/negarit.module";
import { TelegramService } from "./telegram/telegram.service";
import { NegaritService } from "./negarit/negarit.service";

@Module({
    imports: [TelegramModule, NegaritModule],
    controllers: [PlatformController],
    providers: [PlatformService, PrismaService, JwtService, TelegramService, NegaritService],
})
export class PlatformModule {}