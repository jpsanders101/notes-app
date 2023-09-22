import express, { Express, Request, Response } from 'express';
import nunjucks from 'nunjucks';
import notes from './mock-data/notes.json';

const app: Express = express();
const defaultPort = 2468;
const port = process.env.PORT || defaultPort

const logLabel = `[notes-app]`;

nunjucks.configure('views', {
  express: app,
});

app.use(express.static('public'))

app.get('/', (req: Request, res: Response) => {
  console.log('New request');
  res.render('index.html', notes);
});

app.listen(port, () => {
  console.log(`${logLabel} Server is running on port ${port}`);
});
