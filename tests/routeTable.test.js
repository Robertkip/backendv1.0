import { describe, it, expect } from "vitest";
import { apiRoutes } from "../src/routers/index.js";

// Phase 2e "Done when": no two routes share a method and path, because only
// the first one mounted would ever run.
describe("route table", () => {
  const routes = [];
  for (const [prefix, router] of apiRoutes) {
    for (const layer of router.stack) {
      if (!layer.route) continue;
      // Express ignores a trailing slash, and parameter names do not matter.
      const path = `${prefix}${layer.route.path}`.replace(/\/$/, "").replace(/:\w+/g, ":param");
      for (const method of Object.keys(layer.route.methods)) {
        routes.push(`${method.toUpperCase()} ${path}`);
      }
    }
  }

  it("has no duplicate method and path pairs", () => {
    const duplicates = routes.filter((route, i) => routes.indexOf(route) !== i);
    expect([...new Set(duplicates)]).toEqual([]);
  });

  it("has no route path with a misplaced colon", () => {
    expect(routes.filter((route) => /[^/]:/.test(route))).toEqual([]);
  });

  it("does not change or delete records with GET", () => {
    expect(routes.filter((route) => /^GET .*\/(update|delete)/i.test(route))).toEqual([]);
  });
});
