import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { Roles } from 'src/modules/auth/auth.decorator';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { CreatePipe } from './pipe/create/create.pipe';
import { UpdateMentorDto } from './dto/update-mentor.dto';

@Controller('admin/mentors')
@UseGuards(AuthGuard)
@Roles('OWNER')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post()
  @UsePipes(CreatePipe)
  async createMentor(@Body() createMentorDto: CreateMentorDto) {
    return this.mentorService.createMentor(createMentorDto);
  }

  @Get()
  async findMentors() {
    return this.mentorService.findAllMentors();
  }

  @Patch(':id')
  async updateMentor(
    @Param('id') id: string,
    @Body() updateMentorDto: UpdateMentorDto,
  ) {
    return this.mentorService.updateMentor(id, updateMentorDto);
  }
  @Delete(':id')
  async removeMentor(@Param('id') id: string) {
    return this.mentorService.removeMentor(id);
  }
}
