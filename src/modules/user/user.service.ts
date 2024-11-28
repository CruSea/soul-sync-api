import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async CreateUser(
    userInfo: { email: string; imageUrl: string },
    accountName?: string,
  ) {
    const newUser = await this.prisma.user.create({
      data: {
        email: userInfo.email,
        imageUrl: userInfo.imageUrl,
      },
    });

    const account = await this.createAccount(accountName);
    const role = await this.createDefaultRole();

    await this.linkUserToAccount(newUser.uuid, account.uuid, role.uuid);

    return newUser;
  }

  private async createAccount(accountName?: string) {
    if (!accountName) {
      accountName = `user-${await this.generateAccountName()}`;
    }

    return this.prisma.account.create({ data: { name: accountName } });
  }

  private async createDefaultRole() {
    return this.prisma.role.create({
      data: { name: 'Owner', isDefault: true },
    });
  }

  private async linkUserToAccount(
    userId: string,
    accountId: string,
    roleId: string,
  ) {
    return this.prisma.accountUser.create({
      data: {
        userId,
        accountId,
        roleId,
      },
    });
  }

  private async generateAccountName(): Promise<string> {
    const lastAccount = await this.prisma.account.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const lastAccountNumber = lastAccount
      ? parseInt(lastAccount.name.split('-')[1] || '0', 10)
      : 0;
    return (lastAccountNumber + 1).toString().padStart(3, '0');
  }
}
