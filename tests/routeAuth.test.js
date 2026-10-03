import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { sequelize } from "../src/config/connectDb.js";
import { apiRoutes, mountApiRoutes } from "../src/routers/index.js";

// Routes anyone may call without logging in: account creation and login,
// social login, and read-only browsing of listings and reference data.
// Every other route must require a token.
const PUBLIC_ROUTES = [
  "POST /api/v1/signup",
  "POST /api/v1/signin",
  "POST /api/v1/verify",
  "POST /api/v1/verify-agent-login",
  "POST /api/v1/forgotpassword",
  "GET /api/v1/google",
  "GET /api/v1/google/callback",
  "GET /api/v1/facebook",
  "GET /api/v1/facebook/callback",
  "GET /api/v1/role",
  "GET /api/v1/role:/id",
  "GET /api/v1/apartments",
  "GET /api/v1/rentals",
  "GET /api/v1/allapartment",
  "GET /api/v1/allapartment/",
  "GET /api/v1/apartment/:id",
  "GET /api/v1/apartmentaccount/:logent_id",
  "GET /api/v1/single-apartment",
  "GET /api/v1/search-apartment",
  "GET /api/v1/allmarket",
  "GET /api/v1/marketproducts/:sellerId",
  "GET /api/v1/allproperties",
  "GET /api/v1/properties/:id",
  "GET /api/v1/allfacilities",
  "GET /api/v1/facilities/:id",
  "GET /api/v1/alllocations",
  "GET /api/v1/locations",
  "GET /api/v1/locations/search",
  "GET /api/v1/location/:id",
  "GET /api/v1/location/alllocations",
  "GET /api/v1/location/locations",
  "GET /api/v1/location/locations/search",
  "GET /api/v1/location/locations/name/:name",
  "GET /api/v1/location/locations/:id",
];

// Public routes whose handlers currently crash or never respond; see
// DEVELOPMENT_CHECKLIST.md Phase 2. Remove them from here once fixed.
const BROKEN_ROUTES = [
  "GET /api/v1/search-apartment",
  "GET /api/v1/marketproducts/:sellerId",
  "POST /api/v1/forgotpassword",
];

// The response the Authenticated middleware sends when no token is given,
// as opposed to a handler's own 401 such as a wrong password at sign-in.
const blockedByLogin = (res) => res.status === 401 && res.body?.msg === "Unauthorized";

const allRoutes = [];
for (const [prefix, router] of apiRoutes) {
  for (const layer of router.stack) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      const key = `${method.toUpperCase()} ${prefix}${layer.route.path}`;
      if (!allRoutes.includes(key)) allRoutes.push(key);
    }
  }
}
const protectedRoutes = allRoutes.filter((key) => !PUBLIC_ROUTES.includes(key));

const app = express();
app.use(express.json());
mountApiRoutes(app);

describe("route access", () => {
  it("lists only routes that exist as public", () => {
    expect(PUBLIC_ROUTES.filter((key) => !allRoutes.includes(key))).toEqual([]);
  });

  it.each(protectedRoutes)("%s requires a token", async (key) => {
    const [method, path] = key.split(" ");
    const url = path.replace(/:(\w+)/g, "1");

    const res = await request(app)[method.toLowerCase()](url);

    expect(blockedByLogin(res)).toBe(true);
  });

  describe("public routes", () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true });
    });

    afterAll(async () => {
      await sequelize.close();
    });

    it.each(PUBLIC_ROUTES.filter((key) => !BROKEN_ROUTES.includes(key)))("%s works without a token", async (key) => {
      const [method, path] = key.split(" ");
      const url = path.replace(/:(\w+)/g, "1");

      const res = await request(app)[method.toLowerCase()](url);

      expect(blockedByLogin(res)).toBe(false);
    });
  });
});
