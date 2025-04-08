import { Router, Request, Response } from 'express';
import {
  getAuthorizeUrl,
  authenticateUser,
  getOauthTokenSecret,
} from '@backend/services/usos/oauth';
import jwt from 'jsonwebtoken';
import { t } from '@backend/services/trpc';
import { authorizedProcedure } from '@backend/middleware/ensureAuthenticated';

const jwtSecret = process.env.JWT_SECRET;

export const authExpressRouter = Router();

const jwtOptions = {
  expiresIn: '1h',
} as const;

const tokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 1000,
} as const;

authExpressRouter.get('/authorize', async (req: Request, res: Response) => {
  try {
    const { authorizeUrl } = await getAuthorizeUrl('rest/auth/callback');

    res.redirect(authorizeUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error obtaining request token');
  }
});

authExpressRouter.get('/logout', async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.redirect('/');
});

authExpressRouter.get('/callback', async (req: Request, res: Response) => {
  const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = req.query;

  try {
    const oauthTokenSecret = await getOauthTokenSecret(oauthToken as string);

    if (!oauthTokenSecret) {
      return res.status(400).send('Invalid or expired request');
    }

    const user = await authenticateUser(
      oauthToken as string,
      oauthTokenSecret,
      oauthVerifier as string
    );

    const jwtPayload = {
      id: user.id,
    };

    const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);

    res.cookie('token', token, tokenCookieOptions);

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error obtaining access token');
  }
});

export const authRouter = t.router({
  user: authorizedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      first_name: ctx.user.first_name,
      last_name: ctx.user.last_name,
    };
  }),

  check: t.procedure.query(async ({ ctx }) => {
    if (await ctx.getUser()) {
      return { isAuthenticated: true };
    }
    return { isAuthenticated: false };
  }),
});
