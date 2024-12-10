import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { REQUEST } from '@nestjs/core';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}
  create(createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto);
    return 'This action adds a new user';
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
