import {
  PipeTransform,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateChannelDto } from 'src/modules/admin/channel/dto/create-channel.dto';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class CreateChannelPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private readonly prisma: PrismaService,
  ) {}

  async transform(value: CreateChannelDto) {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid token');
      }
      userId = (decoded as JwtPayload).id;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    // Check if the account exists for the current user
    const account = await this.prisma.account.findFirst({
      where: {
        AccountUser: {
          some: { userId: userId, accountId: value.accountId },
        },
      },
    });

    if (!account) {
      throw new UnauthorizedException(
        'Account not found or user does not have access to this account!',
      );
    }

    // Log the account id to the console
    console.log('Account ID:', account.id);

    // Add userId to the value
    value.accountId = account.id.toString();

    return value;
  }
}
