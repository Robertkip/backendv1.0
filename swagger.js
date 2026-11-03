// Writes swagger-output.json (served at /swagger-ui) from the routes the app
// actually mounts, so the docs cannot drift from the code. CI fails when the
// committed file is out of date: run `npm run swagger-autogen` and commit it.
import fs from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import { apiRoutes } from "./src/routers/index.js";

const outputFile = new URL("./swagger-output.json", import.meta.url);

// JSON Schema for a request body, without the keywords Swagger 2.0 rejects.
const bodyJsonSchema = (schema) => {
  const { $schema, ...json } = zodToJsonSchema(schema, { target: "openApi3", $refStrategy: "none" });
  return json;
};

// Upload routes take form fields (Swagger 2.0 formData); the rest a JSON body.
const bodyParams = (schema, isUpload) => {
  if (!schema) return [];
  const json = bodyJsonSchema(schema);
  if (!isUpload) return [{ name: "body", in: "body", required: true, schema: json }];
  return Object.entries(json.properties ?? {}).map(([name, property]) => ({
    name,
    in: "formData",
    required: (json.required ?? []).includes(name),
    type: ["integer", "number", "boolean"].includes(property.type) ? property.type : "string",
  }));
};

const paths = {};
for (const [prefix, router] of apiRoutes) {
  for (const layer of router.stack) {
    if (!layer.route) continue;
    // Express paths use :param and may end in "/"; Swagger uses {param}.
    const expressPath = `${prefix}${layer.route.path}`.replace(/(.)\/$/, "$1");
    const path = expressPath.replace(/:(\w+)/g, "{$1}");
    const params = [...expressPath.matchAll(/:(\w+)/g)].map(([, name]) => ({
      name,
      in: "path",
      required: true,
      type: "string",
    }));
    const needsLogin = layer.route.stack.some((handler) => handler.name === "Authenticated");
    // The body schema checked by validateBody (src/validation/schemas.js).
    const bodySchema = layer.route.stack.find((handler) => handler.handle.schema)?.handle.schema;
    const isUpload = layer.route.stack.some((handler) => handler.name === "multerMiddleware");
    const tag = prefix === "/api/v1" ? expressPath.split("/")[3] : prefix.split("/")[3];

    for (const method of Object.keys(layer.route.methods)) {
      paths[path] ??= {};
      paths[path][method] = {
        tags: [tag],
        ...(isUpload ? { consumes: ["multipart/form-data"] } : {}),
        parameters: [...params, ...bodyParams(bodySchema, isUpload)],
        ...(needsLogin ? { security: [{ bearerAuth: [] }] } : {}),
        responses: {
          200: { description: "OK" },
          ...(bodySchema ? { 400: { description: "Invalid request body" } } : {}),
          ...(needsLogin ? { 401: { description: "Login required" } } : {}),
        },
      };
    }
  }
}

const doc = {
  swagger: "2.0",
  info: {
    title: "Waridi API",
    description: "Generated from the mounted routes by swagger.js.",
    version: "1.0.0",
  },
  basePath: "/",
  schemes: ["https", "http"],
  securityDefinitions: {
    bearerAuth: { type: "apiKey", name: "Authorization", in: "header", description: "Bearer <token>" },
  },
  paths: Object.fromEntries(Object.entries(paths).sort(([a], [b]) => a.localeCompare(b))),
};

fs.writeFileSync(outputFile, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`Wrote ${Object.keys(doc.paths).length} paths to swagger-output.json`);
process.exit(0);
