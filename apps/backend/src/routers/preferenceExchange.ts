import { t } from '@backend/services/trpc';
import { z } from 'zod';
import prisma from '@backend/services/prismaClient';
import { authorizedProcedure } from '@backend/middleware/ensureAuthenticated';

export const preferenceExchangeRouter = t.router({
  createPreference: authorizedProcedure
    .input(
      z.object({
        subjectName: z.string(),
        termId: z.string(),
        currentGroupNumber: z.number(),
        desiredGroupNumber: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newPreference = await prisma.preferenceExchange.create({
        data: {
          userId: ctx.user.id,
          subjectName: input.subjectName,
          termId: input.termId,
          currentGroupNumber: input.currentGroupNumber,
          desiredGroupNumber: input.desiredGroupNumber,
        },
      });
      return newPreference;
    }),
  deletePreference: authorizedProcedure
    .input(
      z.object({
        subjectName: z.string(),
        termId: z.string(),
        currentGroupNumber: z.number(),
        desiredGroupNumber: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const deletedPreference = await prisma.preferenceExchange.deleteMany({
        where: {
          userId: ctx.user.id,
          subjectName: input.subjectName,
          termId: input.termId,
          currentGroupNumber: input.currentGroupNumber,
          desiredGroupNumber: input.desiredGroupNumber,
        },
      });
      return { success: deletedPreference.count > 0 };
    }),
  getPreferences: authorizedProcedure
    .input(
      z.object({
        subjectName: z.string(),
        termId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const preferences = await prisma.preferenceExchange.findMany({
        where: {
          userId: ctx.user.id,
          termId: input.termId,
          subjectName: input.subjectName,
        },
      });
      return preferences;
    }),

  verifyCode: authorizedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const codeEntry = await prisma.code.findUnique({
        where: { code: input.code },
      });
      if (codeEntry) {
        const subjects = codeEntry.subjects;
        return { valid: true, subjects: subjects };
      } else {
        return { valid: false, subjects: [] };
      }
    }),
});
