import { Inject, Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { User } from 'src/modules/admin/user/entities/user.entity';
import { CreateMentorDto } from '../../dto/create-mentor.dto';

@Injectable()
export class CreatePipe implements PipeTransform {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REQUEST') private readonly request: any,
  ) {}
  async transform(value: CreateMentorDto) {
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
