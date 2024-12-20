import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export async function extractAccountIdFromToken(
  token: string,
  jwtService: JwtService,
  prisma: PrismaService,
): Promise<{ userId: string; accountId: string }> {
  if (!token) {
    throw new UnauthorizedException('Token not found');
  }

  let userId: string;
  let accountId: string;
  try {
    const decoded = jwtService.verify(token, { secret: process.env.JWT_SECRET });
    if (typeof decoded === 'string') {
      throw new UnauthorizedException('Invalid token');
    }
    userId = decoded.sub;
    accountId = decoded.accounts[0].id;

  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }

  // Check if the account exists for the current user
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      AccountUser: {
        some: { userId: userId },
      },
    },
  });

  if (!account) {
    throw new UnauthorizedException(
      'Account not found or user does not have access to this account!',
    );
  }


  return { userId, accountId };
}