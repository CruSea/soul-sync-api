import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(accountId: string): Promise<RoleDto[]> {
    const roles = await this.prisma.role.findMany({
      where: {
        accountId: accountId,
      },
      select: {
        id: true,
        name: true,
        accountId: true,
      },
    });
    return roles.map(role => new RoleDto(role));
  }
}
