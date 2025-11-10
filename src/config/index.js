import dotenv from 'dotenv';

// Load env from .env if present
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  },
  swagger: {
    title: process.env.SWAGGER_TITLE || 'API',
    version: process.env.SWAGGER_VERSION || '0.1.0',
    description: process.env.SWAGGER_DESCRIPTION || 'REST API'
  }
};

if (!config.databaseUrl) {
  // Don't throw during import; let server start check it and show friendly message.
  console.warn('Warning: DATABASE_URL is not set. Prisma will fail to connect until it is set.');
}

export default config;
