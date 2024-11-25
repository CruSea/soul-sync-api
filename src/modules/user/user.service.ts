import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(userInfo: { email: string; imageUrl: string }) {
    if (!userInfo.email) {
      throw new Error('Email is required to find or create a user');
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userInfo.email },
    });
    console.log('Received User Info:', userInfo);

    if (existingUser) {
      // Update the imageUrl if it has changed
      if (existingUser.imageUrl !== userInfo.imageUrl) {
        return this.prisma.user.update({
          where: { email: userInfo.email },
          data: { imageUrl: userInfo.imageUrl },
        });
      }
      return existingUser;
    }

    // Create user if not found
    const newUser = await this.prisma.user.create({
      data: {
        email: userInfo.email,
        imageUrl: userInfo.imageUrl,
      },
    });

    // Generate an account name
    const accountName = await this.generateAccountName();

    // Create an account for the user
    const newAccount = await this.prisma.account.create({
      data: { name: accountName },
    });

    // Create a default role
    const defaultRole = await this.prisma.role.create({
      data: {
        name: 'Owner',
        isDefault: true,
      },
    });

    // Link account and user with the role
    await this.prisma.accountUser.create({
      data: {
        accountId: newAccount.uuid,
        userId: newUser.uuid,
        roleId: defaultRole.uuid,
      },
    });

    return newUser;
  }

  async generateAccountName(): Promise<string> {
    const lastAccount = await this.prisma.account.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const lastAccountName = lastAccount ? parseInt(lastAccount.name, 10) : 0;
    const newAccountName = (lastAccountName + 1).toString().padStart(3, '0');

    return newAccountName;
  }
}
