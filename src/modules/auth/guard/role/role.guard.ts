import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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

    const activeAccounts = await this.prisma.accountUser.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        accountId: true,
      },
    });

    const activeAccountIds = activeAccounts.map((account) => account.accountId);

    const hasActiveAccount = user.accounts.some((account) =>
      activeAccountIds.includes(account.id),
    );

    if (!hasActiveAccount) {
      throw new ForbiddenException(
        "Your organization's owner has disabled your account",
      );
    }

    const hasRequiredRole = user.accounts.some(
      (account) =>
        activeAccountIds.includes(account.id) &&
        requiredRoles.some(
          (role) => account.role?.name.toLowerCase() === role.toLowerCase(),
        ),
    );

    if (!hasRequiredRole) {
      throw new NotFoundException('Forbidden resource');
    }

    return true;
  }
}
