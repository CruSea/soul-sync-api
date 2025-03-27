import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AdminDto } from './dto/admin.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

@Injectable()
export class AdminProfileService {
  constructor(
    private prisma: PrismaService,
  ) { }
  
  async findOne(id: string): Promise<AdminDto> {

    const admin = await this.prisma.user.findFirst({
      where: {
        id: id,
        deletedAt: null,
      }
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return new AdminDto({ ...admin });
  }

  async update(id: string, updateAdminProfileDto: UpdateAdminProfileDto): Promise<AdminDto> {
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
    console.log('accountId:', accountId);

    const admins = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        AccountUser: {
          some: {
            accountId: accountId, 
            Role: {
              name: 'Admin',
            },
          },
        },
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

    return admins.map(admin => {

      return new AdminDto({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive
      });
    });
  }
  
  async toggleActiveStatus(id: string): Promise<AdminDto> {

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
        isActive: !existingAdmin.isActive,
      },
    });

    return new AdminDto({ ...updatedAdmin });



  }
  
}
