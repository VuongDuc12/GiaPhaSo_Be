import prisma from '../lib/prisma.js';
import { HttpError } from '../middleware/error.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateTokensForUser, rotateRefreshToken, revokeUserTokens } from './token.service.js';

export async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw HttpError.badRequest('Email already in use', 'email_taken');
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });
    const tokens = await generateTokensForUser(user, req.ip);
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, ...tokens });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw HttpError.unauthorized('Invalid credentials', 'invalid_credentials');
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw HttpError.unauthorized('Invalid credentials', 'invalid_credentials');
    const tokens = await generateTokensForUser(user, req.ip);
    res.json({ user: { id: user.id, email: user.email, name: user.name }, ...tokens });
  } catch (err) { next(err); }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await rotateRefreshToken(refreshToken, req.ip);
    res.json(tokens);
  } catch (err) { next(err); }
}

export async function me(req, res) {
  const { user } = req;
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
}

export async function logout(req, res, next) {
  try {
    await revokeUserTokens(req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
