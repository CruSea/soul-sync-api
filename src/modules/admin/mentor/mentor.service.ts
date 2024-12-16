import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import * as bcrypt from 'bcrypt';
import { REQUEST } from '@nestjs/core';
import { AuthService } from 'src/modules/auth/auth.service';
import { UpdateMentorDto } from './dto/update-mentor.dto';
@Injectable()
export class MentorService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private prisma: PrismaService,
  ) {}

  async createMentor(createMentorDto: CreateMentorDto) {
    const { email, accountId, name } = createMentorDto;

    // Fetch the mentor role ID
    const mentorRole = await this.prisma.role.findFirst({
      where: { type: 'MENTOR' },
    });

    if (!mentorRole) {
      throw new Error('Mentor role not found');
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash(
      '12345678',
      AuthService.saltRounds,
    );

    // Create User entry
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? 'Mentor',
      },
    });

    // Create Mentor record
    const mentor = await this.prisma.mentor.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        expertise: '', // Can be updated later via PATCH endpoint
        isActive: true,
        availability: '', // Add default value
        age: 0, // Add default value
        gender: '', // Add default value
        location: '', // Add default value
      },
    });

    // Link User to Account with Mentor Role
    await this.prisma.accountUser.create({
      data: {
        account: {
          connect: {
            id: accountId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        role: {
          connect: {
            id: mentorRole.id,
          },
        },
        isDeleted: false,
      },
    });

    return { user, mentor };
  }
  async findAllMentors() {
    const mentors = await this.prisma.mentor.findMany({
      where: {
        user: {
          accountUser: {
            some: {
              accountId: this.request.user.accountId, // Assumes `currentAccountId` is set in the request
              isDeleted: false,
            },
          },
        },
      },
      include: {
        user: true, // Include user information
      },
    });

    return mentors;
  }
  async updateMentor(id: string, updateData: UpdateMentorDto) {
    // Extract availability, use the rest as other fields to update
    const { availability, ...otherData } = updateData;

    const mentor = await this.prisma.mentor.update({
      where: { id },
      data: {
        ...otherData, // Assign other data (expertise, age, gender, location, etc.)
        availability: availability
          ? {
              startDate: availability.startDate,
              endDate: availability.endDate,
            }
          : undefined, // Leave availability unchanged if not provided
      },
    });

    if (!mentor) {
      throw new Error('Mentor not found');
    }

    return mentor;
  }
  async removeMentor(id: string): Promise<any> {
    // Fetch the current user's account ID from the request
    const accountId = this.request.user.accountId;

    // Check if the mentor exists and is associated with the current account
    const mentorToDelete = await this.prisma.mentor.findFirst({
      where: {
        id,
        user: {
          accountUser: {
            some: {
              accountId,
              isDeleted: false,
            },
          },
        },
      },
      include: { user: true }, // Include related user data if needed
    });

    if (!mentorToDelete) {
      throw new Error('Mentor not found or you do not have access.');
    }

    // Perform a soft delete by updating the isDeleted fields and marking the mentor as inactive
    const updatedMentor = await this.prisma.mentor.update({
      where: { id },
      data: {
        isActive: false, // Mark the mentor as inactive
        user: {
          update: {
            accountUser: {
              updateMany: {
                where: { accountId },
                data: { isDeleted: true }, // Mark all associated `accountUser` records as deleted
              },
            },
          },
        },
      },
    });

    return updatedMentor; // You can return any structured response here
  }
}
