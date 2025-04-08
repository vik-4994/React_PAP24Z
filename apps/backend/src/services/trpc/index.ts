import { initTRPC } from '@trpc/server';
import { Context } from '@backend/services/trpc/context';

const t = initTRPC.context<Context>().create();

export { t };
