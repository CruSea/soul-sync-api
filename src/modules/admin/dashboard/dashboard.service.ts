import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MentorExpertiseRow } from 'src/types/mentorExpertise';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(accountId) {
    const totalUsers = await this.prisma.accountUser.count({
      where: {
        deletedAt: null,
        accountId: accountId,
      },
    });

    const totalMentors = await this.prisma.accountUser.count({
      where: {
        deletedAt: null,
        accountId: accountId,
        Role: {
          name: 'Mentor',
        },
      },
    });

    const activeMentors = await this.prisma.accountUser.count({
      where: {
        deletedAt: null,
        isActive: true,
        accountId: accountId,
        Role: {
          name: 'Mentor',
        },
      },
    });

    const activeUsers = await this.prisma.accountUser.count({
      where: {
        deletedAt: null,
        isActive: true,
        accountId: accountId,
      },
    });

    const totalMentees = await this.prisma.conversation.findMany({
      where: {
        Channel: {
          accountId: accountId,
        },
      },
      distinct: ['address'],
      select: {
        address: true,
      },
    });

    const currentYear = new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    const users = await this.prisma.accountUser.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lt: startOfNextYear,
        },
        deletedAt: null,
        accountId,
      },
      select: {
        createdAt: true,
      },
    });

    const growthMap: Record<string, number> = {};

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    for (const { createdAt } of users) {
      const year = createdAt.getFullYear();
      const month = monthNames[createdAt.getMonth()];
      const monthYear = `${month} ${year}`; // e.g. "May 2025"

      growthMap[monthYear] = (growthMap[monthYear] || 0) + 1;
    }

    const mentor_by_expertise = await this.prisma.$queryRawUnsafe<
      MentorExpertiseRow[]
    >(
      `
      SELECT 
        expertise_item AS expertise,
        COUNT(DISTINCT mentor_id) AS count
      FROM (
        SELECT 
          id AS mentor_id,
          jsonb_array_elements_text(expertise) AS expertise_item
        FROM "Mentor"
        WHERE "accountId" = $1
      ) AS expanded
      GROUP BY expertise_item
      ORDER BY count DESC
    `,
      accountId,
    );

    return {
      totalUsers,
      totalMentors,
      activeMentors,
      activeUsers,
      totalMentees: totalMentees.length,
      mentorByExpertise: mentor_by_expertise.map((item) => ({
        expertise: item.expertise,
        count: Number(item.count),
      })),
      userGrowth: Object.entries(growthMap).map(([monthYear, count]) => ({
        month: monthYear,
        count,
      }))
    };
  }
}
