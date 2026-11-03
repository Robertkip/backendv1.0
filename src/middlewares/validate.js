// Checks req.body against a zod schema before the handler runs. On success
// req.body is replaced by the parsed value: known fields are trimmed and
// converted (form fields arrive as strings), unknown fields are dropped.
// On failure the client gets 400 with one entry per invalid field.
export const validateBody = (schema) => {
  const validator = (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join(".") || null,
          message: issue.message,
        })),
      });
    }
    req.body = result.data;
    return next();
  };
  // Lets tests and the API docs see which routes are validated, and how.
  validator.schema = schema;
  return validator;
};
