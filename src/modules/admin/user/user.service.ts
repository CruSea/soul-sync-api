import {
  Inject,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { REQUEST } from '@nestjs/core';
import { paginate } from 'src/common/helpers/pagination';
import { User, AccountUser, Role } from '@prisma/client'; // Assuming User is from Prisma model@Injectable()
import { GetAllUsersQueryDto } from './dto/get-all-users-query.dto';
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
      throw new Error('Account not found');
    }

    await this.validateAccountAccess(createUserDto.accountId);

    const role = await this.prisma.role.findFirst({
      where: {
        id: createUserDto.roleId,
      },
    });

    if (role?.name === 'Owner') {
      throw new HttpException(
        'You cannot create a user with owner role!',
        HttpStatus.FORBIDDEN,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      const existingRelation = await this.prisma.accountUser.findFirst({
        where: {
          userId: existingUser.id,
          accountId: createUserDto.accountId,
        },
      });

      if (existingRelation) {
        throw new HttpException(
          'The user already exists in your organization!',
          HttpStatus.CONFLICT,
        );
      }

      await this.prisma.accountUser.create({
        data: {
          userId: existingUser.id,
          accountId: createUserDto.accountId,
          roleId: createUserDto.roleId,
        },
      });

      return { message: 'User added to the organization successfully!' }; // Stop here
    }

    const userData = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: '',
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

  async findAllUsers(query: GetAllUsersQueryDto) {
    const { accountId, roleId, page, limit, isActive } = query;
    console.log('Is active value', isActive);

    await this.validateAccountAccess(accountId);

    const whereCondition = {
      AccountUser: {
        some: roleId
          ? {
              accountId: accountId,
              isActive: isActive !== undefined ? isActive : undefined,
              deletedAt: null,
              OR: [{ Role: { name: 'Owner' } }, { roleId: roleId }],
            }
          : {
              accountId: accountId,
              isActive: isActive !== undefined ? isActive : undefined,
              deletedAt: null,
            },
      },
    };

    const includeCondition = {
      AccountUser: {
        include: {
          Role: true,
        },
      },
    };

    const { data, meta } = await paginate<User>(
      this.prisma,
      this.prisma.user,
      whereCondition,
      page,
      limit,
      includeCondition,
    );

    const users = data.map(
      (user: User & { AccountUser: (AccountUser & { Role: Role })[] }) => {
        const role =
          user.AccountUser.length > 0 && user.AccountUser[0].Role
            ? user.AccountUser[0].Role.name
            : '';

        const isActive = user.AccountUser[0].isActive;

        return new UserDto({
          id: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          role: role,
          status: isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      },
    );

    return {
      data: users,
      meta: meta,
    };
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
        deletedAt: new Date(),
        AccountUser: {
          updateMany: {
            where: { accountId },
            data: { deletedAt: new Date() },
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

  async toggleActiveStatus(userId: string, accountId: string) {
    const accountUser = await this.prisma.accountUser.findFirst({
      where: {
        accountId: accountId,
        userId: userId,
      },
      include: {
        Role: true,
      },
    });

    if (accountUser.Role.name === 'Owner') {
      throw new HttpException(
        'You can not deactivate your own account!',
        HttpStatus.CONFLICT,
      );
    }

    const updatedStatus = await this.prisma.accountUser.update({
      where: {
        id: accountUser.id,
      },
      data: {
        isActive: !accountUser.isActive,
      },
    });

    return {
      message: updatedStatus.isActive ? 'Activated' : 'Deactivated',
      isActive: updatedStatus.isActive,
    };
  }
}
