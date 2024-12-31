import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from "src/modules/prisma/prisma.service";
import axios from 'axios';
import { TelegramService } from "./telegram/telegram.service";
import { NegaritService } from "./negarit/negarit.service";

@Injectable()
export class PlatformService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly telegramService: TelegramService,
        private readonly negaritService: NegaritService,
    ) {}
    
    
    async create(authHeader: string, channelDetails: any) {
        let createChannelDto;

        if(channelDetails.metaData === "Telegram Bot") {
            createChannelDto = this.telegramService.createChannel(channelDetails);
        }else if(channelDetails.metaData === "Negarit") {
            
        }

        return axios.post(
            'http://localhost:3000/channels/create', 
            createChannelDto,
            {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json',
                },
            }
        );   
    }

    async extractAccountId(authHeader: string): Promise<string> {
        const token = authHeader.replace('Bearer ', '');
        const payload = this.jwtService.decode(token);
        const userId = payload.id;
        if (!userId) {
            throw new UnauthorizedException('there is no userId not found');
          }
        let accountId: string;
        try {
        const accountUser = await this.prisma.accountUser.findFirst({
            where: { userId: userId },
        });
    
        if (!accountUser ||!accountUser.accountId || accountUser.accountId.length === 0) {
            throw new UnauthorizedException('User does not have any accounts');
        }
    
        accountId = accountUser.accountId;
    
        } catch (error) {
            throw new UnauthorizedException('Invalid accountId');
        }
        return accountId;
    }    
}