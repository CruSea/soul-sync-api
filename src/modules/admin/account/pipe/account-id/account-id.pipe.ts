import { Inject, Injectable, PipeTransform } from '@nestjs/common';
import { User } from 'src/modules/admin/user/entities/user.entity';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AccountIdPipe implements PipeTransform {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REQUEST') private readonly request: any,
  ) {}
  async transform(value: any) {
    const user: User = this.request.user;
    const account = await this.prisma.account.findFirst({
      where: {
        AccountUser: { some: { userId: user.id, accountId: value } },
      },
    });

    if (!account) {
      throw new Error('Account not found!');
    }
    return value;
  }
}
