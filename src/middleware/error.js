// Centralized error handler
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'internal_error';
  const message = err.expose ? err.message : (status === 500 ? 'Internal Server Error' : err.message);
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[ERR]', err);
  }
  res.status(status).json({
    error: { code, message }
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } });
}

export class HttpError extends Error {
  constructor(status, message, code = undefined, expose = true) {
    super(message);
    this.status = status;
    this.code = code;
    this.expose = expose;
  }
  static badRequest(message = 'Bad Request', code = 'bad_request') {
    return new HttpError(400, message, code);
  }
  static unauthorized(message = 'Unauthorized', code = 'unauthorized') {
    return new HttpError(401, message, code);
  }
  static forbidden(message = 'Forbidden', code = 'forbidden') {
    return new HttpError(403, message, code);
  }
  static notFound(message = 'Not Found', code = 'not_found') {
    return new HttpError(404, message, code);
  }
}
