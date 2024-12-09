import { Injectable, PipeTransform, Inject } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class ValidateUserCreatePipe implements PipeTransform {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REQUEST') private readonly request: any,
  ) {}

  async transform(value: CreateUserDto) {
    const user: User = this.request.user;
    const account = await this.prisma.account.findFirst({
      where: {
        AccountUser: { some: { userId: user.id, accountId: value.accountId } },
      },
    });
    if (!account) {
      throw new Error('Account not found!');
    }
    return { ...value, userId: user.id };
  }
}
