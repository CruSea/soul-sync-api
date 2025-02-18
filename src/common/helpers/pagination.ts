import { PrismaClient } from '@prisma/client';

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function paginate<T>(
  prisma: PrismaClient,
  model: any,
  where: object,
  page: number = 1,
  limit: number = 10,
  include: object = {},
): Promise<PaginationResult<T>> {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
