import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  ValidationPipe,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { Roles } from 'src/modules/auth/auth.decorator';
import { MentorProfileService } from './mentor-profile.service';
import { UpdateMentorDto } from 'src/modules/admin/mentor/dto/update-mentor.dto';
import { RoleGuard } from 'src/modules/auth/guard/role/role.guard';
import { GetMentorDto } from 'src/modules/admin/mentor/dto/get-mentor.dto';

@Controller('mentor')
@UseGuards(AuthGuard, RoleGuard)
@Roles('MENTOR')
export class MentorProfileController {
  constructor(private readonly mentorService: MentorProfileService) {}

  @Get('profile')
  async getProfile(@Req() req, @Query() getMentor: GetMentorDto) {
    return this.mentorService.getProfile(req.user.email, getMentor);
  }

  @Patch('profile')
  async updateProfile(
    @Req() req,
    @Body(new ValidationPipe({ transform: true }))
    updateMentor: UpdateMentorDto,
    @Query() getMentor: GetMentorDto,
  ) {
    return this.mentorService.updateProfile(
      req.user.email,
      updateMentor,
      getMentor,
    );
  }
}
