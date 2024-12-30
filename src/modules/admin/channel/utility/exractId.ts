import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from'src/modules/prisma/prisma.service';

export async function extractAccountId(
  userId: string,
  prisma: PrismaService,
): Promise<{ accountId: string }> {
  if (!userId) {
    throw new UnauthorizedException('there is no userId not found');
  }


  let accountId: string;
  try {
    const accountUser = await prisma.accountUser.findFirst({
      where: { userId: userId },
    });

    if (!accountUser ||!accountUser.accountId || accountUser.accountId.length === 0) {
      throw new UnauthorizedException('User does not have any accounts');
    }

    accountId = accountUser.accountId;

  } catch (error) {
    throw new UnauthorizedException('Invalid accountId');
  }

  
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      accountUsers: {
        some: { userId: userId },
      },
    },
  });

  if (!account) {
    throw new UnauthorizedException(
      'Account not found or user does not have access to this account!',
    );
  }

  return { accountId };
}