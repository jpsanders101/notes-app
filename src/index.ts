import 'dotenv/config';
import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
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

const auth = (req: Request, res: Response, next: NextFunction) => {
  const logLabel = '[Auth]'
  const jwtToken = req.cookies && req.cookies['X-JWT-Token'];

  if (!jwtToken) {
    console.log(`${logLabel} User not authenticated`);
    return next();
  };

  let jwtResponse 
  try {
    console.log(logLabel, jwtToken, jwtSecretKey);
    jwtResponse = jwt.verify(jwtToken, jwtSecretKey);
    console.log(typeof jwtResponse);
    if (!jwtResponse) throw Error('no-jwt-response');
    if (typeof jwtResponse === 'string') throw Error('unexpected-jwt-response');
  } catch (e) {
    console.error(e);
    console.log(`${logLabel} JWT response`, jwtResponse)
    return res.status(400).send('Incorrect login credentials');
  }
  console.log(`${logLabel} User authenticated`);
  
  res.context = { ...res.context, userId: jwtResponse.id, email: jwtResponse.email };
  return next()
}

app.get('/', auth, (req: Request, res: Response) => {
  const logLabel = '[GET /]';
  console.log(`${logLabel} New request`);
  console.log('cookies', req.cookies);
  
  res.render('index.html', res.context);
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
  const user = await login(email, password, client);

  console.log('user', user);

  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecretKey, { expiresIn: '2 days' });
  res.setHeader('Set-Cookie', `X-JWT-Token=${token}`);

  console.log('token', token);

  console.log('Successfully logged in');
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
