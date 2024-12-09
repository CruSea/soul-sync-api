import { Injectable, PipeTransform, Inject } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ValidateAccountIdPipe implements PipeTransform {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REQUEST') private readonly request: any,
  ) {}

  async transform(value) {
    const user: User = this.request.user;
    const account = await this.prisma.account.findFirst({
      where: {
        AccountUser: { some: { userId: user.id, accountId: value.accountId } },
      },
    });
    if (!account) {
      throw new Error('Account not found!');
    }
    return { id: user.id };
  }
}
