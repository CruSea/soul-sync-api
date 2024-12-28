import { Inject, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RoleType } from '@prisma/client';

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
          accountUsers: {
            create: {
              userId: user.id,
              roleId: role.id,
              isDeleted: false,
            },
          },
        },
      });
    });
  }

  async findAll() {
    const user = this.request.user;
    return await this.prisma.account.findMany({
      where: { accountUsers: { some: { userId: user.id } } },
    });
  }

  async findOne(id: string) {
    const user = this.request.user;
    return await this.prisma.account.findFirst({
      where: { id, accountUsers: { some: { userId: user.id } } },
    });
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const user = this.request.user;
    return await this.prisma.account.update({
      where: { id, accountUsers: { some: { userId: user.id } } },
      data: updateAccountDto,
    });
  }

  async remove(id: string) {
    const user = this.request.user;
    return await this.prisma.account.delete({
      where: { id, accountUsers: { some: { userId: user.id } } },
    });
  }
}
