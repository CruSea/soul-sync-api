import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { RoleGuard } from 'src/modules/auth/guard/role/role.guard';
import { Roles } from 'src/modules/auth/auth.decorator';
import { GetAllUsersQueryDto } from './dto/get-all-users-query.dto';

@Controller('admin/user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('OWNER', 'ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('all')
  @UseGuards(RoleGuard)
  @Roles('OWNER')
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: GetAllUsersQueryDto,
  ) {
    return this.userService.findAllUsers(query);
  }

  @Get(':accountId/user/:id')
  @UseGuards(RoleGuard)
  @Roles('OWNER', 'ADMIN')
  findOne(@Param('accountId') accountId: string, @Param('id') id: string) {
    return this.userService.findOne(accountId, id);
  }

  @Patch(':accountId/user/:id')
  @UseGuards(RoleGuard)
  @Roles('OWNER', 'ADMIN')
  update(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(accountId, id, updateUserDto);
  }

  @Delete(':accountId/user/:id')
  @UseGuards(RoleGuard)
  @Roles('OWNER')
  remove(@Param('accountId') accountId: string, @Param('id') id: string) {
    return this.userService.remove(accountId, id);
  }

  @Patch(':userId/activate/:accountId')
  @UseGuards(RoleGuard)
  @Roles('OWNER')
  activate(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
  ) {
    return this.userService.toggleActiveStatus(userId, accountId);
  }
}
