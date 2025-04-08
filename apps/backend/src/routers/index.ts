import { t } from '@backend/services/trpc';
import { usosRouter } from './usos';
import { preferenceExchangeRouter } from './preferenceExchange';
import { Router } from 'express';
import { authExpressRouter, authRouter } from '@backend/routers/auth';

export const appRouter = t.router({
  auth: authRouter,
  usos: usosRouter,
  preferenceExchange: preferenceExchangeRouter,
});

export const appExpressRouter = Router();

appExpressRouter.use('/auth', authExpressRouter);

export type AppRouter = typeof appRouter;
