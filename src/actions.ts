import { Client } from 'pg';
import { ClientError } from './errors';
import client, { clientIsConnected } from './db';
import { NoteRequest } from './types';

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