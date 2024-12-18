import {
  Inject,
  Injectable,
  PipeTransform,
  ForbiddenException,
} from '@nestjs/common';
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
      throw new Error('accountId: Account ID is required!');
    }

    // Check if the account exists and is associated with the requesting user
    const account = await this.prisma.account.findFirst({
      where: {
        id: value.accountId,
        AccountUser: {
          some: { userId: user.id },
        },
      },
    });

    if (!account) {
      throw new ForbiddenException('You do not have access to this account.');
    }

    // If the account check passes, proceed with the request
    return value;
  }
}
