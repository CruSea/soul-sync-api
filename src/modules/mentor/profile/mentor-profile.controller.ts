import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { Roles } from 'src/modules/auth/auth.decorator';
import { MentorProfileService } from './mentor-profile.service';
import { UpdateMentorDto } from 'src/modules/admin/mentor/dto/update-mentor.dto';

@Controller('mentor')
@UseGuards(AuthGuard)
@Roles('MENTOR')
export class MentorProfileController {
  constructor(private readonly mentorService: MentorProfileService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    return this.mentorService.getProfile(req.user.email);
  }

  @Patch('profile')
  async updateProfile(
    @Req() req,
    @Body(new ValidationPipe({ transform: true }))
    updateMentor: UpdateMentorDto,
  ) {
    return this.mentorService.updateProfile(req.user.email, updateMentor);
  }
}
