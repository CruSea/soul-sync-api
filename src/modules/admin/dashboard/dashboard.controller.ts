import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { RoleGuard } from 'src/modules/auth/guard/role/role.guard';
import { Roles } from 'src/modules/auth/auth.decorator';

@Controller('admin/dashboard')
@UseGuards(AuthGuard, RoleGuard)
@Roles('OWNER', 'ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':accountId')
  findAll(@Param('accountId') accountId: string) {
    return this.dashboardService.getDashboardStats(accountId);
  }
}
