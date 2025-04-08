import prisma from '@backend/services/prismaClient';

export async function getUserAcceptedExchanges(
  userId: string,
  sbjName: string,
  currentGroupId: number
) {
  let acceptedExchanges = await prisma.acceptedExchange.findFirst({
    where: {
      subjectName: sbjName,

      student1Id: userId,
      NOT: { groupTo1: currentGroupId },
      // OR: [{ student1Id: userId }, { student2Id: userId }],
    },
  });

  if (acceptedExchanges != undefined) {
    acceptedExchanges.student2Id = '';
  } else {
    acceptedExchanges = await prisma.acceptedExchange.findFirst({
      where: {
        subjectName: sbjName,
        student2Id: userId,
        NOT: { groupTo2: currentGroupId },
        // OR: [{ student1Id: userId }, { student2Id: userId }],
      },
    });
    if (acceptedExchanges != undefined) {
      acceptedExchanges.student1Id = '';
    }
  }

  return acceptedExchanges;
}
