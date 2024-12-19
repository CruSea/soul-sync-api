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
  @Get(':accountId/all')
  async findMentors(@Param('accountId') accountId: string) {
    return this.mentorService.findAllMentors(accountId);
  }

  @Get(':accountId/mentor/:id')
  async findMentorById(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.mentorService.findMentorById(accountId, id);
  }

  @Patch(':accountId/mentor/:id')
  async updateMentor(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @Body() updateMentorDto: UpdateMentorDto,
  ) {
    return this.mentorService.updateMentor(accountId, id, updateMentorDto);
  }
  @Delete(':accountId/mentor/:id')
  async removeMentor(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.mentorService.deleteMentor(accountId, id);
  }
}
