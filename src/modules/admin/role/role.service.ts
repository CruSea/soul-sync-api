import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RoleDto[]> {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        accountId: true,
      },
    });
    return roles.map((role) => new RoleDto(role));
  }
}
