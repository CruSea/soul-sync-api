import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { MentorDto } from './dto/mentor.dto';
import { GetMentorDto } from './dto/get-mentor.dto';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
@Injectable()
export class MentorService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}

  async findAll(getMentor: GetMentorDto): Promise<MentorDto[]> {
    const mentors = await this.prisma.mentor.findMany({
      where: {
        accountId: getMentor.accountId,
        deletedAt: null,
      },
    });

    return await Promise.all(
      mentors.map(async (mentor) => {
        const user = await this.prisma.user.findFirst({
          where: { email: mentor.email },
        });
        return new MentorDto({ ...mentor, user: { ...user } });
      }),
    );
  }

  async findOne(id: string, getMentor: GetMentorDto): Promise<MentorDto> {
    const mentor = await this.prisma.mentor.findFirst({
      where: {
        id: id,
        accountId: getMentor.accountId,
        deletedAt: null,
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const user = await this.prisma.user.findFirst({
      where: { email: mentor.email },
    });

    return new MentorDto({ ...mentor, user: { ...user } });
  }

  async create(createMentor: CreateMentorDto): Promise<MentorDto> {
    let mentor = await this.prisma.mentor.findFirst({
      where: { email: createMentor.email, deletedAt: null },
    });

    if (!mentor) {
      mentor = await this.prisma.mentor.create({
        data: {
          name: createMentor.name,
          email: createMentor.email,
          accountId: createMentor.accountId,
        },
      });
    }

    const user = await this.prisma.user.findFirst({
      where: { email: mentor.email },
    });

    return new MentorDto({ ...mentor, user: { ...user } });
  }

  async update(id: string, updateMentor: UpdateMentorDto): Promise<MentorDto> {
    const mentor = await this.prisma.mentor.update({
      where: { id: id },
      data: updateMentor,
    });

    const user = await this.prisma.user.findFirst({
      where: { email: mentor.email },
    });

    return new MentorDto({ ...mentor, user: { ...user } });
  }

  async delete(id: string): Promise<{ status: boolean }> {
    const mentor = await this.prisma.mentor.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });

    return { status: mentor.deletedAt ? true : false };
  }
}
