import app from './app.js';
import config from './config/index.js';
import prisma from './lib/prisma.js';

async function start() {
  try {
    await prisma.$connect();
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

start();
