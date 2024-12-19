import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateMentorDto } from './dto/update-mentor-info.dto';
@Injectable()
export class MentorsService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}
  async findMentorById(id: string) {
    const mentor = await this.prisma.user.findUnique({
      where: { id },
      include: {
        mentors: true,
      },
    });

    if (!mentor) {
      throw new Error('Mentor not found');
    }

    return mentor;
  }

  async updateMentor(id: string, updateData: UpdateMentorDto) {
    const { availability, ...otherData } = updateData;

    const mentor = await this.prisma.user.update({
      where: { id },
      data: {
        mentors: {
          update: {
            where: {
              userId: id,
            },
            data: {
              ...otherData,
              availability: availability
                ? {
                    startDate: availability.startDate,
                    endDate: availability.endDate,
                  }
                : undefined,
            },
          },
        },
      },
      include: {
        mentors: true,
      },
    });

    if (!mentor) {
      throw new Error('Mentor not found');
    }

    return mentor;
  }
}
