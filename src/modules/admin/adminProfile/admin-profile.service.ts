import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AdminDto } from './dto/admin.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

@Injectable()
export class AdminProfileService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string, accountId: string): Promise<AdminDto> {
    const admin = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        AccountUser: {
          where: {
            accountId: accountId,
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const accountUser = admin.AccountUser.find(
      (au) => au.accountId === accountId,
    );

    return new AdminDto({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isActive: accountUser?.isActive,
    });
  }

  async update(
    id: string,
    updateAdminProfileDto: UpdateAdminProfileDto,
  ): Promise<AdminDto> {
    console.log('Updating admin with ID:', id);

    const existingAdmin = await this.prisma.user.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!existingAdmin) {
      throw new NotFoundException('Admin not found');
    }

    const updatedAdmin = await this.prisma.user.update({
      where: { id: id },
      data: {
        ...updateAdminProfileDto,
      },
    });

    console.log('Updated admin:', updatedAdmin);

    return new AdminDto({ ...updatedAdmin });
  }

  async findAll(accountId: string): Promise<AdminDto[]> {
    const admins = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          {
            AccountUser: {
              some: {
                accountId: accountId,
                Role: {
                  name: 'Admin',
                },
              },
            },
          },
          {
            AccountUser: {
              some: {
                accountId: accountId,
                Role: {
                  name: 'Owner',
                },
              },
            },
          },
        ],
      },
      include: {
        AccountUser: {
          include: {
            Role: true,
          },
        },
      },
    });

    console.log('Filtered Admin Data:', JSON.stringify(admins, null, 2));

    return admins.map((admin) => {
      const accountUser = admin.AccountUser.find(
        (au) => au.accountId === accountId,
      );

      return new AdminDto({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isActive: accountUser?.isActive,
      });
    });
  }

  async toggleActiveStatus(
    accountId: string,
    userId: string,
  ): Promise<AdminDto> {
    const accountUser = await this.prisma.accountUser.findFirst({
      where: {
        accountId: accountId,
        userId: userId,
      },
    });

    const updatedAccountUser = await this.prisma.accountUser.update({
      where: {
        id: accountUser.id,
      },
      data: {
        isActive: !accountUser.isActive,
      },
    });

    const updatedUser = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        AccountUser: {
          where: {
            accountId: accountId,
          },
        },
      },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return new AdminDto({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isActive: updatedAccountUser.isActive,
    });
  }
}
