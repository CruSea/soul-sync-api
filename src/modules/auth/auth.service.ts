import { Injectable } from '@nestjs/common';
import { SignInUserDto } from './dto/sign-in-auth.dto';
import { SignUpUserDto } from './dto/sign-up-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { UserDto } from '../admin/user/dto/user.dto';
import { RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  public static readonly saltRounds = 10;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInUserDto: SignInUserDto): Promise<AuthDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: signInUserDto.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!(await bcrypt.compare(signInUserDto.password, user.password))) {
      throw new Error('Invalid password');
    }

    const token = await this.jwtService.signAsync(user, {
      secret: process.env.JWT_SECRET,
    });

    const roles = await this.prisma.role.findMany({
      where: { AccountUser: { some: { userId: user.id } } },
    });

    return {
      token,
      user: { ...user, roles: roles.map((role) => role.id) },
    };
  }

  async signUp(signUpUserDto: SignUpUserDto): Promise<AuthDto> {
    const user = await this.signInOrUp(signUpUserDto);
    if (!user) {
      throw new Error('User not found');
    }
    const token = await this.jwtService.signAsync(user, {
      secret: process.env.JWT_SECRET,
    });
    return {
      token,
      user: new UserDto(user),
    };
  }

  async signInOrUp(signUpUserDto: SignUpUserDto) {
    const { email, name, password } = signUpUserDto;

    const user = await this.prisma.user.findFirst({ where: { email } });
    if (user) {
      return user;
    }

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: { name },
      });

      if (!account) {
        throw new Error('Failed to create account');
      }

      const role = await tx.role.findFirst({
        where: {
          type: RoleType.OWNER,
          isDefault: true,
        },
      });

      if (!role) {
        throw new Error('Default owner role not found');
      }

      const hashedPassword = await bcrypt.hash(
        password,
        AuthService.saltRounds,
      );

      return tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          accountUser: {
            create: {
              accountId: account.id,
              roleId: role.id,
              isDeleted: false,
            },
          },
        },
      });
    });
  }

  async getUserIfRefreshTokenMatches(email: string) {
    let user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { email: email, name: email, password: '' },
      });
    }
    return { userId: email };
  }

  async getUserRoles(userId: string) {
    return this.prisma.role.findMany({
      where: { AccountUser: { some: { userId } } },
    });
  }

  async getUserAccounts(userId: string) {
    return this.prisma.accountUser.findMany({
      where: { userId },
      include: { account: true },
    });
  }
}
