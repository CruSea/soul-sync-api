import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AccountUserService {
  constructor(private readonly prisma: DatabaseService) {}

  async addMentorToAccount(accountUserUuid: string, user: any) {
    const accountUser = await this.prisma.accountUser.findUnique({
      where: { uuid: accountUserUuid },
      include: { account: true, role: true },
    });

    if (!accountUser) {
      throw new Error('AccountUser not found');
    }

    const mentorRole = await this.prisma.role.findFirst({
      where: { name: 'mentor' },
    });

    if (!mentorRole) {
      throw new Error('Role "mentor" not found');
    }

    // Create the AccountUser relation for the mentor
    const accountUserRelation = await this.prisma.accountUser.create({
      data: {
        userId: user.uuid,
        accountId: accountUser.account.uuid,
        roleId: mentorRole.uuid,
      },
    });

    // Create the mentor record and associate it with the AccountUser relation
    const mentor = await this.prisma.mentor.create({
      data: {
        accountUserId: accountUserRelation.uuid,
        name: user.email,
      },
    });

    return mentor;
  }
}
