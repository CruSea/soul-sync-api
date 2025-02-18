import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Post,
  Body,
  Patch,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { Roles } from 'src/modules/auth/auth.decorator';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { GetMentorDto } from './dto/get-mentor.dto';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';

@Controller('admin/mentor')
@UseGuards(AuthGuard)
@Roles('OWNER')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Get()
  async getMentors(
    @Query(new ValidationPipe({ transform: true })) query: Record<string, any>,
  ) {
    return this.mentorService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id, @Query() getMentor: GetMentorDto) {
    return this.mentorService.findOne(id, getMentor);
  }

  @Post()
  async create(@Body() createMentor: CreateMentorDto) {
    return this.mentorService.create(createMentor);
  }

  @Patch()
  async update(@Param('id') id, @Body() updateMentor: UpdateMentorDto) {
    return this.mentorService.update(id, updateMentor);
  }

  @Delete(':id')
  async delete(@Param('id') id) {
    return this.mentorService.delete(id);
  }
}
