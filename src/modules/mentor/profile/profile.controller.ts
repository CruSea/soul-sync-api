import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  ValidationPipe,
  Req,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { Roles } from 'src/modules/auth/auth.decorator';
import { ProfileService } from './profile.service';
import { UpdateMentorDto } from 'src/modules/admin/mentor/dto/update-mentor.dto';
import { RoleGuard } from 'src/modules/auth/guard/role/role.guard';
import { GetMentorDto } from 'src/modules/admin/mentor/dto/get-mentor.dto';
import { MentorDto } from 'src/modules/admin/mentor/dto/mentor.dto';

@Controller('mentor')
@UseGuards(AuthGuard, RoleGuard)
@Roles('MENTOR')
export class ProfileController {
  constructor(private readonly mentorService: ProfileService) {}

  @Get('profile')
  async getProfile(
    @Req() req,
    @Query() getMentor: GetMentorDto,
  ): Promise<MentorDto> {
    const mentorExists = await this.mentorService.findByEmailAndAccount(
      req.user.email,
      getMentor.accountId,
    );
    if (!mentorExists) {
      throw new NotFoundException('Mentor not found for this account');
    }
    return this.mentorService.getProfile(mentorExists.id, getMentor);
  }

  @Patch('profile')
  async updateProfile(
    @Req() req,
    @Body(new ValidationPipe({ transform: true }))
    updateMentor: UpdateMentorDto,
    @Query() getMentor: GetMentorDto,
  ): Promise<MentorDto> {
    const mentorExists = await this.mentorService.findByEmailAndAccount(
      req.user.email,
      getMentor.accountId,
    );
    if (!mentorExists) {
      throw new NotFoundException('Mentor not found for this account');
    }
    return this.mentorService.updateProfile(
      mentorExists.id,
      updateMentor,
      getMentor,
    );
  }
}
