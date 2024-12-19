import { Expose } from "class-transformer";

export class ConversationDto {
    @Expose()
    id: string;

    @Expose()
    mentorId: string;

    @Expose()
    address: string;

    @Expose()
    channelId: string;

    @Expose()
    isActive: boolean;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    constructor(partial: Partial<ConversationDto>) {
        this.id = partial.id;
        this.mentorId = partial.mentorId;
        this.address = partial.address;
        this.channelId = partial.channelId;
        this.isActive = partial.isActive;
        this.createdAt = partial.createdAt;
        this.updatedAt = partial.updatedAt;
    }
}