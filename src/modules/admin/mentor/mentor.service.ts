import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { MentorDto } from './dto/mentor.dto';
import { GetMentorDto } from './dto/get-mentor.dto';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate, PaginationResult } from 'src/common/helpers/pagination';

@Injectable()
export class MentorService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}

  async findAll(
    query: Record<string, any>,
  ): Promise<PaginationResult<MentorDto>> {
    const getMentorDto = new GetMentorDto();
    getMentorDto.accountId = query.accountId;

    const paginationDto = new PaginationDto();
    paginationDto.page = query.page ? parseInt(query.page) : 1;
    paginationDto.limit = query.limit ? parseInt(query.limit) : 10;

    return paginate(
      this.prisma,
      this.prisma.mentor,
      { accountId: getMentorDto.accountId, deletedAt: null },
      paginationDto.page,
      paginationDto.limit,
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

      let user = await this.prisma.user.findFirst({
        where: { email: mentor.email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: { name: mentor.name, email: mentor.email, password: '' },
        });
      }

      return new MentorDto({ ...mentor, user: { ...user } });
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
