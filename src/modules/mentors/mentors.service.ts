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
    const { availability, expertise, ...otherData } = updateData;

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
              expertise: expertise ? expertise.join(',') : undefined,
              availability: availability
                ? JSON.stringify(availability)
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

    return {
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      mentors: mentor.mentors.map((m) => ({
        age: m.age,
        location: m.location,
        gender: m.gender,
        expertise: m.expertise ? m.expertise.split(',') : [],
        availability: m.availability
          ? JSON.parse(m.availability as string)
          : {},
      })),
    };
  }
}
