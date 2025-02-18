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
import { Roles } from 'src/modules/auth/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('admin/user')
@UseGuards(AuthGuard)
@Roles('OWNER')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get(':accountId/all')
  async findAll(
    @Param('accountId') accountId: string,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    return this.userService.findAllUsers(accountId, paginationDto);
  }

  @Get(':accountId/user/:id')
  findOne(@Param('accountId') accountId: string, @Param('id') id: string) {
    return this.userService.findOne(accountId, id);
  }

  @Patch(':accountId/user/:id')
  update(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(accountId, id, updateUserDto);
  }

  @Delete(':accountId/user/:id')
  remove(@Param('accountId') accountId: string, @Param('id') id: string) {
    return this.userService.remove(accountId, id);
  }
}
