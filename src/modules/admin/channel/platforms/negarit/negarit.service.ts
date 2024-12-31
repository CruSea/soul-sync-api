import { Injectable } from "@nestjs/common";
import { CreateChannelDto } from "../../dto/create-channel.dto";

@Injectable()
export class NegaritService {

    //I filled it with dummy data and will be replaced with real data later
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