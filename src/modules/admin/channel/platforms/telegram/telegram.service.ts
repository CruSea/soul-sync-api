import { Injectable } from "@nestjs/common";

@Injectable()
export class TelegramService {
    async createChannel(channelDetails: any) {
        return {
            name: channelDetails.name,
            metaData: channelDetails.metaData,
            metaData2: channelDetails.metaData2,
            metaData3: channelDetails.metaData3,
            metaData4: channelDetails.metaData4,
            metaData5: channelDetails.metaData5,
            metaData6: channelDetails.metaData6,
            metaData7: channelDetails.metaData7,
            metaData8: channelDetails.metaData8,
            metaData9: channelDetails.metaData9,
            metaData10: channelDetails.metaData10,
        };
    }
}     