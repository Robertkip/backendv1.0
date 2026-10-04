// Writes swagger-output.json (served at /swagger-ui) from the routes the app
// actually mounts, so the docs cannot drift from the code. CI fails when the
// committed file is out of date: run `npm run swagger-autogen` and commit it.
import fs from "fs";
import { apiRoutes } from "./src/routers/index.js";

const outputFile = new URL("./swagger-output.json", import.meta.url);

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
    const tag = prefix === "/api/v1" ? expressPath.split("/")[3] : prefix.split("/")[3];

    for (const method of Object.keys(layer.route.methods)) {
      paths[path] ??= {};
      paths[path][method] = {
        tags: [tag],
        parameters: params,
        ...(needsLogin ? { security: [{ bearerAuth: [] }] } : {}),
        responses: { 200: { description: "OK" }, ...(needsLogin ? { 401: { description: "Login required" } } : {}) },
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
