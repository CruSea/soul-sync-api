import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateChannelDto } from "./dto/create-channel.dto";
import axios from "axios";

@Injectable()
export class TelegramChannelService {
    async extractFromToken(telegramToken: string, accountId: string): Promise<CreateChannelDto> {
       
        const url = `https://api.telegram.org/bot${telegramToken}/getMe`;
        console.log("telegramToken: ", url);
        try 
        {
            const decoded = await axios.get(url);
            return {
                name: String(decoded.data.result.first_name),
                username: String(decoded.data.result.username),
                accountId: String(accountId),
                configuration: JSON.stringify(decoded.data.result),
                metaData: JSON.stringify(decoded.data.result)
            };
        } catch (error) {
            throw new BadRequestException('Failed to fetch data from Telegram API. Invalid token or network issue.');
        }
    }

}


