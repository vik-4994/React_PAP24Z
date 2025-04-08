import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllExchanges = async (
  page: number,
  itemsPerPage: number,
  subjects: string[] | undefined,
  group: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  completed: boolean,
) => {
  const skip = (page - 1) * itemsPerPage;
  const take = itemsPerPage;

  const filters: any = {
    ...(subjects?.length ? { subjectName: { in: subjects } } : {}),
    ...(group
      ? {
          OR: [
            { groupFrom1: parseInt(group, 10) },
            { groupTo1: parseInt(group, 10) },
            { groupFrom2: parseInt(group, 10) },
            { groupTo2: parseInt(group, 10) },
          ],
        }
      : {}),
    ...(startDate ? { createdAt: { gte: new Date(startDate) } } : {}),
    ...(endDate ? { createdAt: { lte: new Date(endDate) } } : {}),
    completed,
  };


  const [exchanges, totalExchanges] = await prisma.$transaction([
    prisma.acceptedExchange.findMany({
      skip,
      take,
      where: filters,
      orderBy: { createdAt: "desc" },
      include: {
        student1: { select: { first_name: true, last_name: true } },
        student2: { select: { first_name: true, last_name: true } },
      },
    }),
    prisma.acceptedExchange.count({
      where: filters,
    }),
  ]);

  const modifiedExchanges = exchanges.map((exchange) => ({
    ...exchange,
    first_name1: exchange.student1.first_name,
    last_name1: exchange.student1.last_name,
    first_name2: exchange.student2.first_name,
    last_name2: exchange.student2.last_name,
  }));

  return {
    exchanges: modifiedExchanges,
    totalPages: Math.ceil(totalExchanges / itemsPerPage),
  };
};


export const markExchangeAsCompleted = async (exchangeId: string) => {
  await prisma.acceptedExchange.update({
    where: { id: exchangeId },
    data: { completed: true },
  });
};
