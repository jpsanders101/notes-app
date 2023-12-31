if (process.env.LOCAL) {
  require('dotenv').config();
}
import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { LoginRequestBody } from './types/index';
import { auth, getNotes } from './middleware';
import { ClientError } from './errors';
import client, { clientIsConnected, login, addNote } from './db';

const app: Express = express();
const defaultPort = 2468;
const port = process.env.PORT || defaultPort

const jwtSecretKey = process.env.JWT_SECRET_KEY;

if (typeof jwtSecretKey !== 'string') {
  console.log('Missing jwt secret key');
  process.exit(1);
}

const logLabel = `[notes-app]`;

nunjucks.configure('views', {
  express: app,
});

const asyncMiddleware = (routeHandler: Function) => (req: Request, res: Response, next: NextFunction) => {
  return routeHandler(req, res).catch(next);
}

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', auth, getNotes, (req: Request, res: Response) => {
  const logLabel = '[GET /]';
  console.log(`${logLabel} invoked`);  
  res.render('index.html', res.context);
});

app.post('/login', asyncMiddleware(async (req: Request, res: Response) => {
  const logLabel = '[POST /login]';
  console.log(`${logLabel} invoked`, req.body);
  const loginRequestBody: LoginRequestBody = req.body;
  const { email, password } = loginRequestBody;

  console.log(`${logLabel} Connected to database`);
  await clientIsConnected;;
  const user = await login(email, password, client);

  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecretKey, { expiresIn: '2 days' });
  res.setHeader('Set-Cookie', `X-JWT-Token=${token}`);

  console.log(`${logLabel} Successfully logged in`);
  res.redirect('/');
}));

app.post('/logout', asyncMiddleware(async (req: Request, res: Response) => {
  const logLabel = 'POST /logout';
  console.log(`${logLabel} invoked`, req.body);
  res.setHeader('Set-Cookie', `X-JWT-Token=""`);
  res.redirect('/');
}));

app.post('/note', auth, asyncMiddleware(async (req: Request, res: Response) => {
  const logLabel = 'POST /note';
  console.log(`${logLabel} invoked`, req.body);
  if (!res.context?.userId) {
    console.error(`${logLabel} not authenticated`);
    return res.sendStatus(403);
  }
  await addNote({ subject: req.body.subject, body: req.body.body, userId: res.context.userId });
  res.redirect('/');
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (res.headersSent) {
    return next(err)
  }
  if (err instanceof ClientError) {
    return res.sendStatus(400);
  }
  return res.sendStatus(500);
})

app.listen(port, () => {
  console.log(`${logLabel} Server is running on port ${port}`);
});
