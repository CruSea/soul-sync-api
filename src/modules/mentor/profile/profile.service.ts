import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateMentorDto } from 'src/modules/admin/mentor/dto/update-mentor.dto';
import { MentorDto } from 'src/modules/admin/mentor/dto/mentor.dto';
import { GetMentorDto } from 'src/modules/admin/mentor/dto/get-mentor.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findByEmailAndAccount(
    email: string,
    accountId: string,
  ): Promise<{ id: string }> {
    const mentor = await this.prisma.mentor.findFirst({
      where: { email, accountId, deletedAt: null },
    });
    return { id: mentor?.id };
  }

  async getProfile(id: string, getMentor: GetMentorDto): Promise<MentorDto> {
    const mentor = await this.prisma.mentor.findFirst({
      where: { id, accountId: getMentor.accountId, deletedAt: null },
    });

    return new MentorDto({ ...mentor });
  }

  async updateProfile(
    id: string,
    updateMentor: UpdateMentorDto,
    getMentor: GetMentorDto,
  ): Promise<MentorDto> {
    const updatedMentor = await this.prisma.mentor.update({
      where: { id: id, accountId: getMentor.accountId },
      data: {
        ...updateMentor,
        availability:
          typeof updateMentor.availability === 'string'
            ? JSON.parse(updateMentor.availability)
            : updateMentor.availability,
        expertise: updateMentor.expertise ? updateMentor.expertise : undefined,
        capacity: updateMentor.capacity ? updateMentor.capacity : undefined,
      },
    });

    return new MentorDto({ ...updatedMentor });
  }
}
