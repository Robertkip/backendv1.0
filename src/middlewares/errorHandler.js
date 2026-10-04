// Express 4 does not catch a rejected promise from an async handler: the
// request hangs and the rejection can take the process down. Wrapping a
// handler forwards that rejection to next(), so errorHandler answers it.
export const asyncHandler = (handler) => {
  const wrapped = function (req, res, next) {
    let result;
    try {
      result = handler.call(this, req, res, next);
    } catch (error) {
      return next(error);
    }
    if (result && typeof result.catch === "function") {
      result.catch(next);
    }
    return result;
  };
  Object.defineProperty(wrapped, "name", { value: handler.name });
  return wrapped;
};

// Wraps every handler on every route of a router, in place.
export const wrapRouterHandlers = (router) => {
  for (const layer of router.stack) {
    if (!layer.route) continue;
    for (const routeLayer of layer.route.stack) {
      // Four-argument handlers are error handlers; Express tells them apart by arity.
      if (routeLayer.handle.length < 4 && !routeLayer.handle.__asyncWrapped) {
        routeLayer.handle = asyncHandler(routeLayer.handle);
        routeLayer.handle.__asyncWrapped = true;
      }
    }
  }
  return router;
};

// Final error handler: logs the real error and answers with a 500 that does
// not leak internals. Errors that carry a 4xx status (bad JSON, upload
// limits) keep it.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = Number(err?.status || err?.statusCode);
  const isClientError = status >= 400 && status < 500;

  if (!isClientError) {
    console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  }
  if (res.headersSent) {
    return;
  }
  if (isClientError) {
    return res.status(status).json({ message: err.message || "Bad request" });
  }
  return res.status(500).json({ message: "Internal server error" });
};
