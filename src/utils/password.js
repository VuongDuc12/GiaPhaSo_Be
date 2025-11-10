import bcrypt from 'bcrypt';
import config from '../config/index.js';

export async function hashPassword(plain) {
  const saltRounds = config.bcrypt.saltRounds;
  return bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}
