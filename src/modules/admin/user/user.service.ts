import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { REQUEST } from '@nestjs/core';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/modules/auth/auth.service';
import { RoleType } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}
  async create(createUserDto: CreateUserDto) {
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
            accountId: createUserDto.accountId,
            roleId: createUserDto.roleId,
            isDeleted: false,
          },
        },
      },
      include: {
        accountUser: true, // Include the related accountUser data
      },
    });

    return new UserDto(userData);
  }

  async findAll(): Promise<UserDto[]> {
    const user: User = this.request.user;
    const users = await this.prisma.user.findMany({
      where: {
        accountUser: {
          some: {
            userId: user.id,
            isDeleted: false, // Filter out deleted users
          },
        },
      },
      include: { accountUser: true },
    });
    return users.map((user) => new UserDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user: User = this.request.user;

    const userData = await this.prisma.user.findFirst({
      where: {
        id,
        accountUser: {
          some: {
            userId: user.id,
            isDeleted: false, // Exclude deleted users
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

  async findUsersByRole(roleType: RoleType): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        accountUser: {
          some: {
            role: {
              type: roleType,
            },
            isDeleted: false, // Exclude soft-deleted users
          },
        },
      },
      include: {
        accountUser: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map((user) => new UserDto(user));
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user: User = this.request.user;
    const userData = await this.prisma.user.update({
      where: { id, accountUser: { some: { userId: user.id } } },
      data: updateUserDto,
    });

    if (!userData) {
      throw new Error('User not found');
    }

    return new UserDto(userData);
  }

  async remove(id: string): Promise<UserDto> {
    const user: User = this.request.user;

    const userToDelete = await this.prisma.user.findFirst({
      where: {
        id,
        accountUser: { some: { userId: user.id } },
      },
      include: { accountUser: true },
    });

    if (!userToDelete) {
      throw new Error('User not found or you do not have access.');
    }

    // Perform soft delete
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        accountUser: {
          updateMany: {
            where: { userId: id },
            data: { isDeleted: true },
          },
        },
      },
      include: { accountUser: true },
    });

    return new UserDto(updatedUser);
  }
}
