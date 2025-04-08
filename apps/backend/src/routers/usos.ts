import { z } from 'zod';
import { scrapeTimetable } from '@backend/services/usos/scrapeTimetable';
import { makeAnonymousUsosApiCall } from '@backend/services/usos/oauth';
import { authorizedProcedure } from '@backend/middleware/ensureAuthenticated';
import { t } from '@backend/services/trpc';
import { findMatchingPreferences } from '@backend/services/getExchanges';
import { makeExchange } from '@backend/services/makeExchange';
import { getAllExchanges, markExchangeAsCompleted } from '@backend/services/getAllExchanges';
import { getUserAcceptedExchanges } from '@backend/services/getUserAcceptedExchange';

export const usosRouter = t.router({
  scrape_timetable: t.procedure
    .input(
      z.object({
        subjectCode: z.string(),
        termCode: z.string(),
      })
    )
    .query(async ({ input: { subjectCode, termCode }, ctx }) => {
      return await scrapeTimetable(subjectCode, termCode);
    }),

  courses_user_course_editions: authorizedProcedure.query(async ({ ctx }) => {
    return await ctx.callUsosAuthorized('services/courses/user', {
      fields: 'course_editions',
    });
  }),

  current_semester: t.procedure.query(async () => {
    const currentDate = new Date().toISOString().split('T')[0];

    const result = await makeAnonymousUsosApiCall('services/terms/search', {
      min_finish_date: currentDate,
      max_start_date: currentDate,
    });

    return result[0];
  }),

  userPhoto: authorizedProcedure.query(async ({ ctx }) => {
    return await ctx.callUsosAuthorized('services/users/user', {
      fields: 'photo_urls',
      id: ctx.user.id,
    });
  }),

  userTimetable: authorizedProcedure.query(async ({ ctx }) => {
    return await ctx.callUsosAuthorized('services/tt/user', {});
  }),

  classGroup: t.procedure
    .input(
      z.object({
        unit_id: z.string(),
        group_number: z.string(),
      })
    )
    .query(async ({ input }) => {
      const result = await makeAnonymousUsosApiCall(
        'services/tt/classgroup',
        input
      );
      return result;
    }),

  findPreferences: authorizedProcedure.query(async ({ ctx }) => {
    const result = await findMatchingPreferences(ctx.user.id);
    return result;
  }),

  checkCourseStatus: t.procedure
    .input(
      z.object({
        subjectName: z.string(),
        userId: z.string(),
        groupId:z.number()
      })
    )
    .query(async ({ input }) => {
      const result = await getUserAcceptedExchanges(
        input.userId,
        input.subjectName,
        input.groupId
      );

      return result;
    }),
  getUserId: authorizedProcedure.query(async ({ ctx }) => {
    return ctx.user.id;
  }),

  acceptExchange: authorizedProcedure
    .input(
      z.object({
        student1Id: z.string(),
        student2Id: z.string(),
        subjectName: z.string(),
        groupFrom1: z.number(),
        groupTo1: z.number(),
        groupFrom2: z.number(),
        groupTo2: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(ctx);
      input.student2Id = ctx.user.id;
      const res = await makeExchange(input);
      return res;
    }),

    getAcceptedExchanges: t.procedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        itemsPerPage: z.number().min(1).default(10),
        subjects: z.array(z.string()).optional(),
        group: z.string().nullable(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        completed: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => {
      const { page, itemsPerPage, subjects, group, startDate, endDate, completed } = input;
      const res = await getAllExchanges(page, itemsPerPage, subjects, group, startDate, endDate, completed);
      return res;
    }),


  markExchangeAsCompleted: t.procedure.input(z.object({ exchangeId: z.string() })).mutation(async ({ input }) => {
    const { exchangeId } = input
    await markExchangeAsCompleted(exchangeId)
    return { success: true }
  }),
});
