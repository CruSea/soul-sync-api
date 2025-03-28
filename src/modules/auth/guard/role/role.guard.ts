import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../../auth.decorator';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { User } from 'src/modules/admin/user/entities/user.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const user: User = context.switchToHttp().getRequest().user;

    console.log('User:', user);

    const activeAccounts = await this.prisma.accountUser.findMany({
      where: {
        userId: user.sub,
        isActive: true,
      },
      select: {
        accountId: true,
      },
    });

    const activeAccountIds = activeAccounts.map((account) => account.accountId);

    return user.accounts.some(
      (account) =>
        activeAccountIds.includes(account.id) &&
        requiredRoles.some(
          (role) => account.role?.name.toLowerCase() === role.toLowerCase(),
        ),
    );
  }
}
