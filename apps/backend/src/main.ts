import { createContext } from '@backend/services/trpc/context';
import express from 'express';
import cookieParser from 'cookie-parser';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appExpressRouter, appRouter } from '@backend/routers';
import path from 'path';
// import morgan from 'morgan';
import cors from 'cors'; 

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
  // app.use(morgan('dev'));
} else {
  console.log('Running in production mode');
}

app.use(cookieParser());

app.use(cors());

const reactBuildPath = path.join(__dirname, "..", "..", "..", "..", "frontend");

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(reactBuildPath));
}

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use('/rest', appExpressRouter);

if (process.env.NODE_ENV === 'production') {
  app.get("*", (req, res) => {
    res.sendFile(path.join(reactBuildPath, "index.html"));
  });
}

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
