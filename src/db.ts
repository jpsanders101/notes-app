
import { Client } from 'pg';

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
}))

export default client;