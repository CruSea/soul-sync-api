import { Inject, Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class CreatePipe implements PipeTransform {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REQUEST') private readonly request: any,
  ) {}
  async transform(value: CreateUserDto) {
    const user: User = this.request.user;
    if (!value.accountId) {
      throw new Error('accountId: Account id is required!');
    }

    const account = await this.prisma.account.findFirst({
      where: {
        AccountUser: { some: { userId: user.id, accountId: value.accountId } },
      },
    });

    if (!account) {
      throw new Error('Account not found!');
    }
    return value;
  }
}
