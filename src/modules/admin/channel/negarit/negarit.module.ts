import { Module } from '@nestjs/common';
import { NegaritController } from './negarit.controller';
import { NegaritService } from './negarit.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
    controllers: [NegaritController],
    exports: [NegaritService],
    providers: [NegaritService, PrismaService],
    //imports: [PrismaService],
})
export class NegaritModule {}
