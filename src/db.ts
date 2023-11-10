
import { Client } from 'pg';
import { NoteRequest } from './types';
import { ClientError } from './errors';

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbSSL = Boolean(process.env.DB_SSL);

const client = new Client({
  user: dbUser,
  password: dbPassword,
  host: dbHost,
  database: dbName,
  port: 5432,
  ssl: dbSSL
});

export const clientIsConnected = new Promise((res, rej) => client.connect().then(res).catch((e) => {
  console.error('Failed to connect to db', e);
  rej();
}));

export async function login(email: String, password: String, client: Client) {
  const query = `
    SELECT U.ID,
    U.EMAIL,
    U.PASSWORD
  FROM "user" U
  WHERE u.email = '${email}' AND u.password = '${password}';`;
  console.log('Querying for user');
  const res = await client.query(query);

  if (res.rows.length === 0) {
    console.error('User with given credentials cannot be found');
    throw new ClientError('email-or-password-incorrect');
  }
  return res.rows[0];
}

export async function getNotesByUserId(userId: number) {
  await clientIsConnected;;
  const query = `SELECT ID,
    USER_ID,
    SUBJECT,
    BODY
  FROM "note"
  WHERE USER_ID = ${userId};`;
  console.log('Querying for notes');
  const res = await client.query(query);
  return res.rows;
}

export async function addNote(req: NoteRequest) {
  await clientIsConnected;
  const query = `INSERT INTO "note"(USER_ID,
    SUBJECT,
    BODY)
    VALUES('${req.userId}', '${req.subject}', '${req.body}')`;
    const res = await client.query(query);
    console.log('Successfully added note', res.rowCount);
}

export default client;