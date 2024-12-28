import { IsBoolean, IsString } from "class-validator";

export class CreateConversationDto {
    @IsString()
    mentorId: string;
    @IsString()
    meteeId: string;
    @IsString()
    channelId: string;
/*      @IsBoolean()
    isActive: boolean; */
}
