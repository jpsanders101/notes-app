import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 2468;

const logLabel = `[notes-app]`

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Hello World</h1>');
});

app.listen(port, () => {
  console.log(`${logLabel} Server is running at http://localhost:${port}`);
});