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
  NotFoundException,
} from '@nestjs/common';
import { MentorService } from 'src/modules/admin/mentor/mentor.service';
import { Roles } from 'src/modules/auth/auth.decorator';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { GetMentorDto } from './dto/get-mentor.dto';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { RoleGuard } from 'src/modules/auth/guard/role/role.guard';
import { MentorDto } from './dto/mentor.dto';

@Controller('admin/mentor')
@UseGuards(AuthGuard, RoleGuard)
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
  async findOne(
    @Param('id', new ValidationPipe({ transform: true })) id: string,
    @Query(new ValidationPipe({ transform: true })) getMentor: GetMentorDto,
  ): Promise<MentorDto> {
    const mentorExists = await this.mentorService.findByIdAndAccount(
      id,
      getMentor.accountId,
    );
    if (!mentorExists) {
      throw new NotFoundException('Mentor not found for this account');
    }
    return this.mentorService.findOne(id, getMentor);
  }

  @Post()
  async create(@Body() createMentor: CreateMentorDto) {
    return this.mentorService.create(createMentor);
  }

  @Patch(':id')
  async update(
    @Param('id', new ValidationPipe({ transform: true })) id: string,
    @Body() updateMentor: UpdateMentorDto,
    @Query() getMentor: GetMentorDto,
  ): Promise<MentorDto> {
    const mentorExists = await this.mentorService.findByIdAndAccount(
      id,
      getMentor.accountId,
    );
    if (!mentorExists) {
      throw new NotFoundException('Mentor not found for this account');
    }
    return this.mentorService.update(id, updateMentor, getMentor);
  }

  @Delete(':id')
  async delete(
    @Param('id', new ValidationPipe({ transform: true })) id: string,
    @Query() getMentor: GetMentorDto,
  ) {
    const mentorExists = await this.mentorService.findByIdAndAccount(
      id,
      getMentor.accountId,
    );
    if (!mentorExists) {
      throw new NotFoundException('Mentor not found for this account');
    }
    return this.mentorService.delete(id, getMentor);
  }
}
