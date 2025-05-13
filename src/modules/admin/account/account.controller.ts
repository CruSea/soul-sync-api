import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Query,
} from '@nestjs/common';
import { AccountService } from 'src/modules/admin/account/account.service';
import { CreateAccountDto } from 'src/modules/admin/account/dto/create-account.dto';
import { UpdateAccountDto } from 'src/modules/admin/account/dto/update-account.dto';
import { AccountIdPipe } from 'src/modules/admin/account/pipe/account-id/account-id.pipe';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('admin/account')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.accountService.findAll(paginationDto);
  }

  @UsePipes(AccountIdPipe)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @UsePipes(AccountIdPipe)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(id, updateAccountDto);
  }

  @UsePipes(AccountIdPipe)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }
}
