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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await this.prisma.accountUser.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
        deletedAt: null,
        accountId,
      },
      select: {
        createdAt: true,
      },
    });

    const growthMap: Record<string, number> = {};

    for (const { createdAt } of users) {
      const date = createdAt.toISOString().split('T')[0];
      growthMap[date] = (growthMap[date] || 0) + 1;
    }

    const groupedByDay = Object.entries(growthMap).map(([date, count]) => ({
      createdAt: date,
      _count: { id: count },
    }));

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
      userGrowth: groupedByDay.map((item) => ({
        date: item.createdAt,
        count: item._count.id,
      })),
    };
  }
}
