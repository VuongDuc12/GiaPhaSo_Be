import { PrismaClient } from '@prisma/client';
import config from '../config/index.js';

const prisma = new PrismaClient({
  log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

export default prisma;
