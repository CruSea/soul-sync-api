import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { AdminProfileService } from './admin-profile.service';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { RoleGuard } from 'src/modules/auth/guard/role/role.guard';
import { Roles } from '../auth/auth.decorator';

@Controller('admin/profile')
@UseGuards(AuthGuard)
export class AdminProfileController {
  constructor(private readonly adminProfileService: AdminProfileService) {}

  @Get(':accountId/:userId/')
  @UseGuards(RoleGuard)
  @Roles('OWNER', 'ADMIN')
  findOne(
    @Param('userId') userId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.adminProfileService.findOne(userId, accountId);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('OWNER', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateAdminProfileDto: UpdateAdminProfileDto,
  ) {
    return this.adminProfileService.update(id, updateAdminProfileDto);
  }

  @Get('all/:accountId')
  @UseGuards(RoleGuard)
  @Roles('OWNER')
  findAll(@Param('accountId') accountId) {
    return this.adminProfileService.findAll(accountId);
  }

  @Patch(':userId/activate/:accountId')
  @UseGuards(RoleGuard)
  @Roles('OWNER')
  activate(
    @Param('userId') userId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.adminProfileService.toggleActiveStatus(userId, accountId);
  }
}
