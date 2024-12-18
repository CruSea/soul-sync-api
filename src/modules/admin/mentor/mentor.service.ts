import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import * as bcrypt from 'bcrypt';
import { REQUEST } from '@nestjs/core';
import { AuthService } from 'src/modules/auth/auth.service';
import { UpdateMentorDto } from './dto/update-mentor.dto';
@Injectable()
export class MentorService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}

  async createMentor(createMentorDto: CreateMentorDto) {
    const { email, name, accountId } = createMentorDto;
    await this.validateAccountAccess(accountId);

    const mentorRole = await this.prisma.role.findFirst({
      where: { type: 'MENTOR' },
    });

    if (!mentorRole) {
      throw new Error('Mentor role not found');
    }

    const hashedPassword = await bcrypt.hash(
      '12345678',
      AuthService.saltRounds,
    );

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? 'Mentor',
      },
    });

    const mentor = await this.prisma.mentor.create({
      data: {
        user: { connect: { id: newUser.id } },
        expertise: '',
        isActive: true,
        availability: '',
        age: 0,
        gender: '',
        location: '',
      },
    });

    // Link User to Account with Mentor Role
    await this.prisma.accountUser.create({
      data: {
        account: {
          connect: {
            id: accountId,
          },
        },
        user: {
          connect: {
            id: newUser.id,
          },
        },
        role: {
          connect: {
            id: mentorRole.id,
          },
        },
        isDeleted: false,
      },
    });

    return { user: newUser, mentor };
  }
  async findAllMentors(accountId: string) {
    await this.validateAccountAccess(accountId);

    const mentors = await this.prisma.mentor.findMany({
      where: {
        user: {
          accountUser: {
            some: {
              accountId,
              isDeleted: false,
            },
          },
        },
      },
      include: {
        user: true,
      },
    });

    return mentors;
  }

  async findMentorById(accountId: string, id: string) {
    await this.validateAccountAccess(accountId);

    const mentor = await this.prisma.mentor.findFirst({
      where: {
        id,
        user: {
          accountUser: {
            some: {
              accountId,
              isDeleted: false,
            },
          },
        },
      },
      include: {
        user: true,
      },
    });

    if (!mentor) {
      throw new Error('Mentor not found');
    }

    return mentor;
  }

  async updateMentor(
    accountId: string,
    id: string,
    updateData: UpdateMentorDto,
  ) {
    await this.validateAccountAccess(accountId);

    const { availability, ...otherData } = updateData;

    const mentor = await this.prisma.mentor.update({
      where: {
        id,
        user: {
          accountUser: {
            some: {
              accountId,
              isDeleted: false,
            },
          },
        },
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
    });

    if (!mentor) {
      throw new Error('Mentor not found');
    }

    return mentor;
  }
  async deleteMentor(accountId: string, mentorId: string) {
    await this.validateAccountAccess(accountId);
    const mentorToDelete = await this.prisma.mentor.findFirst({
      where: {
        id: mentorId,
        user: {
          accountUser: {
            some: {
              accountId,
              isDeleted: false,
            },
          },
        },
      },
      include: { user: true },
    });

    if (!mentorToDelete) {
      throw new Error('Mentor not found or you do not have access.');
    }

    // Perform soft delete
    return this.prisma.mentor.update({
      where: { id: mentorId },
      data: {
        isActive: false,
        user: {
          update: {
            accountUser: {
              updateMany: {
                where: { accountId },
                data: { isDeleted: true },
              },
            },
          },
        },
      },
    });
  }
  private async validateAccountAccess(accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        AccountUser: { some: { userId: this.request.user.id } },
      },
    });

    if (!account) {
      throw new ForbiddenException('You do not have access to this account.');
    }

    return account;
  }
}
