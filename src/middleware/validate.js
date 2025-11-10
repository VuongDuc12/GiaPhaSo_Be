import { ZodError } from 'zod';
import { HttpError } from './error.js';

export const validate = (schema) => (req, _res, next) => {
  try {
    const data = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });
    // If schema maps/transforms, propagate back
    if (data.body) req.body = data.body;
    if (data.params) req.params = data.params;
    if (data.query) req.query = data.query;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
      return next(new HttpError(400, 'Validation failed', 'validation_error', true, details));
    }
    next(err);
  }
};
