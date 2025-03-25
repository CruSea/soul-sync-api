import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateMentorDto } from 'src/modules/admin/mentor/dto/update-mentor.dto';
import { MentorDto } from 'src/modules/admin/mentor/dto/mentor.dto';

@Injectable()
export class MentorProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(email: string): Promise<MentorDto> {
    const mentor = await this.prisma.mentor.findFirst({
      where: { email, deletedAt: null },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor profile not found');
    }
    const user = await this.prisma.user.findFirst({
      where: { email: mentor.email },
    });
    console.log('Fetched Mentor:', mentor);

    return new MentorDto({ ...mentor, user: user ? { ...user } : null });
  }

  async updateProfile(
    email: string,
    updateMentor: UpdateMentorDto,
  ): Promise<MentorDto> {
    const mentor = await this.prisma.mentor.findFirst({
      where: { email },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }
    const user = await this.prisma.user.findFirst({
      where: { email: mentor.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateMentor.email && updateMentor.email !== mentor.email) {
      await this.prisma.user.update({
        where: { email: mentor.email },
        data: { email: updateMentor.email },
      });
    }

    const updatedMentor = await this.prisma.mentor.update({
      where: { id: mentor.id },
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
    const updatedUser = await this.prisma.user.findFirst({
      where: { email: updateMentor.email || mentor.email },
    });

    return new MentorDto({ ...updatedMentor, user: { ...updatedUser } });
  }
}
