import { PrismaClient, PreferenceExchange } from '@prisma/client';
const prisma = new PrismaClient();

export const findMatchingPreferences = async (userId: any) => {
  const userPreferences = await prisma.preferenceExchange.findMany({
    where: { userId },
  });

  const desiredPreferences = userPreferences.map((pref) => ({
    desiredGroupNumber: pref.desiredGroupNumber,
    subjectName: pref.subjectName,
    currentGroupNumber: pref.currentGroupNumber,
  }));

  const matchingPreferences = await prisma.preferenceExchange.findMany({
    where: {
      userId: {
        not: userId,
      },
      OR: desiredPreferences.map((pref) => ({
        currentGroupNumber: pref.desiredGroupNumber,
        desiredGroupNumber: pref.currentGroupNumber,
        subjectName: pref.subjectName,
      })),
    },
    include: {
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  return matchingPreferences;
};
