import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

import jwt from 'jsonwebtoken';
import prisma from '@backend/services/prismaClient';
import { User } from '@prisma/client';

const jwtSecret = process.env.JWT_SECRET;

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  const getUser = async (): Promise<User | null> => {
    const token = req.cookies.token;
    if (!token) return null;

    try {
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      return user || null;
    } catch (err) {
      return null;
    }
  };

  return {
    req,
    res,
    getUser,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
