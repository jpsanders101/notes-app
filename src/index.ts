import express, { Express, Request, Response } from 'express';
import nunjucks from 'nunjucks';
import notes from './mock-data/notes.json';

const app: Express = express();
const port = 2468;

const logLabel = `[notes-app]`;

nunjucks.configure('views', {
  express: app,
});

app.use(express.static('public'))

app.get('/', (req: Request, res: Response) => {
  res.render('index.html', notes);
});

app.listen(port, () => {
  console.log(`${logLabel} Server is running at http://localhost:${port}`);
});
