import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getNotesByUserId} from './db';

const jwtSecretKey = process.env.JWT_SECRET_KEY;

if (typeof jwtSecretKey !== 'string') {
  console.log('Missing jwt secret key');
  process.exit(1);
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const logLabel = '[Auth]'
  const jwtToken = req.cookies && req.cookies['X-JWT-Token'];

  if (!jwtToken) {
    console.log(`${logLabel} User not authenticated`);
    return next();
  };

  let jwtResponse 
  try {
    jwtResponse = jwt.verify(jwtToken, jwtSecretKey);
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

export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
  const logLabel = '[getNotes]';
  const userId = res.context?.userId
  if (!userId) {
    console.log(`${logLabel} User not logged in`);
    return next();
  }
  const notes = await getNotesByUserId(userId);
  res.context = { ...res.context, notes };
  return next();
}