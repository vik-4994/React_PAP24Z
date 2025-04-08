import { TRPCError } from '@trpc/server';
import { t } from '@backend/services/trpc';
import { UsosApiUrls } from '@backend/services/usos/apiUrls';
import { makeAuthorizedUsosApiCall } from '@backend/services/usos/oauth';

export const authorizedProcedure = t.procedure.use(async (opts) => {
  const user = await opts.ctx.getUser();

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const callUsosAuthorized = async <T extends keyof UsosApiUrls>(
    url: T,
    params: UsosApiUrls[T]['params']
  ): Promise<UsosApiUrls[T]['reply']> => {
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }
    return (await makeAuthorizedUsosApiCall(
      user,
      url,
      params
    )) as UsosApiUrls[T]['reply'];
  };

  return opts.next({
    ctx: {
      user,
      callUsosAuthorized,
    },
  });
});
