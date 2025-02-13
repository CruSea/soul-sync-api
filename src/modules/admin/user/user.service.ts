import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { REQUEST } from '@nestjs/core';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/modules/auth/auth.service';
import { paginate, PaginationResult } from 'src/common/helpers/pagination';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: createUserDto.accountId },
    });

    if (!account) {
      throw new Error('Account does not exist');
    }

    await this.validateAccountAccess(createUserDto.accountId);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      AuthService.saltRounds,
    );

    const userData = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        AccountUser: {
          create: {
            accountId: createUserDto.accountId,
            roleId: createUserDto.roleId,
          },
        },
      },
      include: {
        AccountUser: true,
      },
    });

    return new UserDto(userData);
  }

  async findOne(accountId: string, id: string): Promise<UserDto> {
    await this.validateAccountAccess(accountId);

    const userData = await this.prisma.user.findFirst({
      where: {
        id,
        AccountUser: {
          some: {
            accountId,
          },
        },
      },
      include: {
        AccountUser: true,
      },
    });

    if (!userData) {
      throw new Error('User not found or access is restricted');
    }

    return new UserDto(userData);
  }

  async findAllUsers(
    accountId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<UserDto>> {
    await this.validateAccountAccess(accountId);

    const { page, limit } = paginationDto;

    return paginate(
      this.prisma,
      this.prisma.user,
      {
        AccountUser: {
          some: {
            accountId: accountId,
          },
        },
      },
      page,
      limit,
    );
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
        AccountUser: {
          some: {
            accountId,
          },
        },
      },
      include: { AccountUser: true },
    });

    if (!userToDelete) {
      throw new Error('User not found or you do not have access.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        AccountUser: {
          updateMany: {
            where: { accountId },
            data: { deletedAt: Date() },
          },
        },
      },
      include: { AccountUser: true },
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
