import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

// Security & logging
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.LOG_LEVEL || (config.env === 'development' ? 'dev' : 'combined')));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Docs
try {
  const swaggerDocument = YAML.load('./src/docs/openapi.yaml');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Swagger spec not loaded:', e.message);
}

// Routes
app.use('/api/v1', routes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

export default app;
