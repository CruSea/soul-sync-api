import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: DatabaseService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async CreateUser(
    userInfo: { email: string; imageUrl: string },
    accountName?: string,
  ) {
    const user = await this.prisma.user.create({
      data: {
        email: userInfo.email,
        imageUrl: userInfo.imageUrl,
      },
    });

    // Create Account
    const generatedAccountName =
      accountName || `Account-${user.uuid.slice(0, 6)}`;
    const account = await this.prisma.account.create({
      data: { name: generatedAccountName },
    });

    // Assign Role (owner)
    const ownerRole = await this.prisma.role.findFirst({
      where: { name: 'owner' },
    });
    if (!ownerRole) {
      throw new Error('Role "owner" not found');
    }

    await this.prisma.accountUser.create({
      data: {
        accountId: account.uuid,
        userId: user.uuid,
        roleId: ownerRole.uuid,
      },
    });

    return user;
  }
}
