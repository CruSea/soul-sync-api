import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { REQUEST } from '@nestjs/core';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/modules/auth/auth.service';

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
            isDeleted: false
          },
        },
      },
    });

    return new UserDto(userData);
  }

  async findAll(): Promise<UserDto[]> {
    const user: User = this.request.user;
    const users = await this.prisma.user.findMany({
      where: { accountUser: { some: { userId: user.id } } },
    });
    return users.map((user) => new UserDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user: User = this.request.user;
    const userData = await this.prisma.user.findFirst({
      where: { id, accountUser: { some: { userId: user.id } } },
    });

    if (!userData) {
      throw new Error('User not found');
    }

    return new UserDto(userData);
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
