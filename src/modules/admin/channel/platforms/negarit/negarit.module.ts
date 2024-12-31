import { Module } from "@nestjs/common";
import { NegaritService } from "./negarit.service";

@Module({})
export class NegaritModule {
    providors: [NegaritService];
    exports: [NegaritService];
}