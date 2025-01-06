import { IsString } from "class-validator";

export class CreateConversationDto {
    @IsString()
    mentorId: string;

    @IsString()
    address: string;

    @IsString()
    channelId: string;
}