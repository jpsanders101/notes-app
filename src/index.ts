import 'dotenv/config';
import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import { LoginRequestBody, PageContext } from './types/index';
import { Client } from 'pg';
import { login } from './actions';
import { ClientError } from './errors';

const app: Express = express();
const defaultPort = 2468;
const port = process.env.PORT || defaultPort

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbSSL = Boolean(process.env.DB_SSL);

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

app.get('/', (req: Request, res: Response) => {
  console.log('New request');

  const context: PageContext = {};
  res.render('index.html', context);
});

app.post('/login', asyncMiddleware(async (req: Request, res: Response) => {
  console.log('/login invoked', req.body);
  const loginRequestBody: LoginRequestBody = req.body;
  const { email, password } = loginRequestBody;

  const client = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    database: dbName,
    port: 5432,
    ssl: dbSSL
  });

  console.log('Connected to database');
  await client.connect();
  const userNotes = await login(email, password, client);
  const context: PageContext = {
    email: userNotes[0].email,
    notes: userNotes.map((n) => ({ id: n.id, body: n.body, subject: n.subject }))
  }
  console.log('Successfully logged in');
  res.render('index.html', context);
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
