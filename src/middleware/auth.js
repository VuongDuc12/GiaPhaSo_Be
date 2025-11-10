import { verifyAccessToken } from '../utils/jwt.js';
import { HttpError } from './error.js';
import prisma from '../lib/prisma.js';

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw HttpError.unauthorized('Missing Authorization header');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) throw HttpError.unauthorized('User not found');
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(HttpError.unauthorized('Access token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(HttpError.unauthorized('Invalid access token'));
    }
    next(err);
  }
}
