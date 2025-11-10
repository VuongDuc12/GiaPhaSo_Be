import crypto from 'crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import prisma from '../lib/prisma.js';
import { HttpError } from '../middleware/error.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function generateTokensForUser(user, ipAddress = null) {
  const jti = crypto.randomUUID();
  const accessToken = signAccessToken({ sub: user.id });
  const refreshToken = signRefreshToken({ sub: user.id, jti });

  const tokenHash = hashToken(refreshToken);
  const now = new Date();
  const decoded = verifyRefreshToken(refreshToken); // to get exp
  const expiresAt = new Date(decoded.exp * 1000);

  await prisma.refreshToken.create({
    data: {
      jti,
      tokenHash,
      userId: user.id,
      createdByIp: ipAddress,
      expiresAt
    }
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(oldTokenRaw, ipAddress = null) {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldTokenRaw);
  } catch (e) {
    if (e.name === 'TokenExpiredError') throw HttpError.unauthorized('Refresh token expired');
    throw HttpError.unauthorized('Invalid refresh token');
  }

  const tokenHash = hashToken(oldTokenRaw);
  const stored = await prisma.refreshToken.findFirst({ where: { tokenHash, revoked: false } });
  if (!stored) throw HttpError.unauthorized('Refresh token not found or revoked');
  if (stored.expiresAt < new Date()) throw HttpError.unauthorized('Refresh token expired');

  // Revoke old token
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true, revokedAt: new Date(), replacedByTokenJti: crypto.randomUUID() } });

  // Issue new tokens
  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) throw HttpError.unauthorized('User no longer exists');
  const tokens = await generateTokensForUser(user, ipAddress);
  return tokens;
}

export async function revokeUserTokens(userId) {
  await prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true, revokedAt: new Date() } });
}
