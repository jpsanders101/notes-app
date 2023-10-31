import { Client } from 'pg';
import { ClientError } from './errors';

export async function login(email: String, password: String, client: Client) {
  const query = `
    SELECT U.ID,
    U.EMAIL,
    U.PASSWORD,
    N.ID note_id,
    N.SUBJECT,
    N.BODY
  FROM "user" U
  LEFT JOIN "note" N ON U.ID = N.USER_ID
  WHERE u.email = '${email}' AND u.password = '${password}';`;
  console.log('Querying for user');
  const res = await client.query(query);

  if (res.rows.length === 0) {
    console.error('User with given credentials cannot be found');
    throw new ClientError('email-or-password-incorrect');
  }
  return res.rows;
}