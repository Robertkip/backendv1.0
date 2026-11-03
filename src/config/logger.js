import { randomUUID } from "crypto";
import pino from "pino";
import { pinoHttp } from "pino-http";

// One JSON line per log entry, ready for a log collector. LOG_LEVEL is one of
// fatal, error, warn, info (default), debug, trace or silent.
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Never write credentials, even when a whole request ends up in a log entry.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
      "*.password",
      "*.confirm_password",
      "*.token",
      "*.accessToken",
    ],
    censor: "[redacted]",
  },
});

// Logs every request once, when it finishes, with a request id. The id is
// taken from an X-Request-Id header (set by a proxy) or generated, and sent
// back in the X-Request-Id response header so a client report can be matched
// to the server logs.
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const id = req.headers["x-request-id"] || randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  customLogLevel: (req, res, err) => (err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
});

// Logs an error that happened while handling req, tagged with its request id
// when the request logger is in front (req.log), or with method and URL.
export const logRequestError = (req, err, message) =>
  (req.log ?? logger).error({ err, method: req.method, url: req.originalUrl }, message);
