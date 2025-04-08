import { PrismaClient, PreferenceExchange } from '@prisma/client';
const prisma = new PrismaClient();

interface ExchangeContext {
  student1Id: string;
  student2Id: string;
  subjectName: string;
  groupFrom1: number;
  groupTo1: number;
  groupFrom2: number;
  groupTo2: number;
  completed: boolean;
}

export const makeExchange = async (ctx: any) => {
  const {
    student1Id,
    student2Id,
    subjectName,
    groupFrom1,
    groupTo1,
    groupFrom2,
    groupTo2,
  } = ctx;

  try {
    await prisma.preferenceExchange.deleteMany({
      where: {
        subjectName,
        userId: { in: [student1Id, student2Id] },
      },
    });

    await prisma.acceptedExchange.create({
      data: {
        student1Id,
        student2Id,
        subjectName,
        groupFrom1,
        groupTo1,
        groupFrom2,
        groupTo2,
      },
    });

    return { success: true, status: 200 };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to process exchange');
  }
}
