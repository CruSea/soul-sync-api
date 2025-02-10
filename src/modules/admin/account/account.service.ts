import { Inject, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RoleType } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.util';

@Injectable()
export class AccountService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    const user = this.request.user;
    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.findFirst({
        where: {
          type: RoleType.OWNER,
          isDefault: true,
        },
      });

      if (!role) {
        throw new Error('Default owner role not found');
      }
      return await this.prisma.account.create({
        data: {
          name: createAccountDto.name,
          AccountUser: {
            create: {
              userId: user.id,
              roleId: role.id,
            },
          },
        },
      });
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const user = this.request.user;
    const { page, limit } = paginationDto;
    const { skip, take } = paginate(page, limit);

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where: { AccountUser: { some: { userId: user.id } } },
        skip,
        take,
      }),
      this.prisma.account.count({
        where: { AccountUser: { some: { userId: user.id } } },
      }),
    ]);

    return {
      data: accounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = this.request.user;
    return await this.prisma.account.findFirst({
      where: { id, AccountUser: { some: { userId: user.id } } },
    });
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const user = this.request.user;
    return await this.prisma.account.update({
      where: { id, AccountUser: { some: { userId: user.id } } },
      data: updateAccountDto,
    });
  }

  async remove(id: string) {
    const user = this.request.user;
    return await this.prisma.account.delete({
      where: { id, AccountUser: { some: { userId: user.id } } },
    });
  }
}
