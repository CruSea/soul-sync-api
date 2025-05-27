import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { MentorDto } from './dto/mentor.dto';
import { GetMentorDto } from './dto/get-mentor.dto';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { RoleType } from '@prisma/client';
import { PaginationResult, paginate } from 'src/common/helpers/pagination';
import { PaginationDto } from 'src/common/dto/pagination.dto';
@Injectable()
export class MentorService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}

  async findByIdAndAccount(id: string, accountId: string): Promise<boolean> {
    const mentor = await this.prisma.mentor.findFirst({
      where: { id, accountId, deletedAt: null },
    });
    return !!mentor;
  }

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

    return new MentorDto({ ...mentor });
  }

  async create(createMentorDto: CreateMentorDto): Promise<MentorDto> {
    let mentor = await this.prisma.mentor.findFirst({
      where: { email: createMentorDto.email, deletedAt: null },
    });

    if (!mentor) {
      mentor = await this.prisma.mentor.create({
        data: {
          name: createMentorDto.name,
          email: createMentorDto.email,
          accountId: createMentorDto.accountId,
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

      const role = await this.prisma.role.findFirst({
        where: {
          type: RoleType.MENTOR,
          isDefault: true,
        },
      });

      if (!role) {
        throw new NotFoundException('Default mentor role not found');
      }

      await this.prisma.accountUser.create({
        data: {
          userId: user.id,
          accountId: createMentorDto.accountId,
          roleId: role.id,
        },
      });

      return new MentorDto({ ...mentor });
    }

    return new MentorDto({ ...mentor });
  }

  async update(
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

  async delete(
    id: string,
    getMentor: GetMentorDto,
  ): Promise<{ status: boolean }> {
    const mentor = await this.prisma.mentor.update({
      where: { id: id, accountId: getMentor.accountId },
      data: { deletedAt: new Date() },
    });

    return { status: mentor.deletedAt ? true : false };
  }
}
