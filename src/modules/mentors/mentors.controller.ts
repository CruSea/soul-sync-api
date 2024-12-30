import {
  Controller,
  UseGuards,
  UsePipes,
  Get,
  Patch,
  Param,
  Body,
} from '@nestjs/common';

import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { Roles } from 'src/modules/auth/auth.decorator';
import { PipePipe } from './pipe/pipe.pipe';
import { UpdateMentorDto } from './dto/update-mentor-info.dto';
import { MentorsService } from './mentors.service';
@Controller('mentors')
@UseGuards(AuthGuard)
@Roles('MENTOR')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}
  @Get(':id')
  @UsePipes(PipePipe)
  async findMentorById(@Param('id') id: string) {
    return this.mentorsService.findMentorById(id);
  }

  @Patch(':id')
  async updateMentor(
    @Param('id') id: string,
    @Body() updateMentorDto: UpdateMentorDto,
  ) {
    return this.mentorsService.updateMentor(id, updateMentorDto);
  }
}
