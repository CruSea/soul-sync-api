import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../../auth/guard/role/role.guard';
import { Roles } from '../../auth/auth.decorator';
import { RoleService } from './role.service';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';

@Controller('roles')
@UseGuards(AuthGuard)
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  @Get('')
  @UseGuards(RoleGuard)
  @Roles('OWNER', 'ADMIN')
  findAll() {
    return this.roleService.findAll();
  }
}
