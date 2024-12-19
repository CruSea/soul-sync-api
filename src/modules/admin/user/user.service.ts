import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { REQUEST } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}
  async create(accountId: string, createUserDto: CreateUserDto) {
    await this.validateAccountAccess(accountId);

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      AuthService.saltRounds,
    );

    const userData = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        accountUser: {
          create: {
            accountId: accountId,
            roleId: createUserDto.roleId,
            isDeleted: false,
          },
        },
      },
      include: {
        accountUser: true,
      },
    });

    return new UserDto(userData);
  }

  async findOne(accountId: string, id: string): Promise<UserDto> {
    await this.validateAccountAccess(accountId);

    const userData = await this.prisma.user.findFirst({
      where: {
        id,
        accountUser: {
          some: {
            accountId,
            isDeleted: false,
          },
        },
      },
      include: {
        accountUser: true,
      },
    });

    if (!userData) {
      throw new Error('User not found or access is restricted');
    }

    return new UserDto(userData);
  }

  async findAllUsers(accountId: string) {
    await this.validateAccountAccess(accountId);

    return this.prisma.user.findMany({
      where: {
        accountUser: {
          some: {
            accountId: accountId,
            isDeleted: false,
          },
        },
      },
    });
  }

  async updateUser(
    accountId: string,
    userId: string,
    updateUserDto: UpdateUserDto,
  ) {
    await this.validateAccountAccess(accountId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { ...updateUserDto },
    });
  }

  async remove(accountId: string, id: string): Promise<UserDto> {
    await this.validateAccountAccess(accountId);

    const userToDelete = await this.prisma.user.findFirst({
      where: {
        id,
        accountUser: {
          some: {
            accountId,
            isDeleted: false,
          },
        },
      },
      include: { accountUser: true },
    });

    if (!userToDelete) {
      throw new Error('User not found or you do not have access.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        accountUser: {
          updateMany: {
            where: { accountId },
            data: { isDeleted: true },
          },
        },
      },
      include: { accountUser: true },
    });

    return new UserDto(updatedUser);
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
