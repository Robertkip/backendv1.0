import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

// Email delivery goes through RabbitMQ, an external service.
vi.mock("../src/rabbitmq/publisher.js", () => ({ publishEmailJob: vi.fn() }));

const { sequelize } = await import("../src/config/connectDb.js");
const { apiRoutes, mountApiRoutes } = await import("../src/routers/index.js");
const { errorHandler } = await import("../src/middlewares/errorHandler.js");
const { default: User } = await import("../src/models/authModel.js");
const { default: Role } = await import("../src/models/role.js");
const { default: UserProfile } = await import("../src/models/userProfileModel.js");
const { default: Apartment } = await import("../src/models/apartmentModel.js");
const { default: Property } = await import("../src/models/propertyModel.js");
const { default: Market } = await import("../src/models/marketModel.js");
const { default: Location } = await import("../src/models/locationModel.js");

// Phase 2 "Done when": every GET route, called with a valid token, answers
// with one of these statuses. No crashes, no timeouts and no 500s.
const ACCEPTED = [200, 400, 401, 403, 404];

// Routes that rely on an external service which is not configured in tests
// (Google Places, Google and Facebook sign-in) may also answer 503.
const EXTERNAL = [
  "GET /api/v1/search-apartment",
  "GET /api/v1/search-property",
  "GET /api/v1/google",
  "GET /api/v1/google/callback",
  "GET /api/v1/facebook",
  "GET /api/v1/facebook/callback",
  "POST /api/v1/send-notification",
];

// Extra query strings to try on top of the bare route.
const QUERIES = {
  "GET /api/v1/single-apartment": ["?search=Flat"],
  "GET /api/v1/single-property": ["?search=Plot"],
  "GET /api/v1/search-apartment": ["?place=Nairobi"],
  "GET /api/v1/search-property": ["?place=Nairobi"],
  "GET /api/v1/get-single-user": ["?id=1", "?id=abc"],
  "GET /api/v1/get-messages/": ["?senderId=1&receiverId=2"],
  "GET /api/v1/location/alllocations": ["?location=Nairobi", "?apartment_id=1", "?apartment_id=abc", "?grouped=true"],
  "GET /api/v1/location/locations": ["?location=Nairobi", "?active=true"],
  "GET /api/v1/location/locations/search": ["?search=Nairobi"],
  "GET /api/v1/token/": ["?receiverId=1"],
  "GET /api/v1/user/": ["?search=owner"],
};

// Each route param is tried with an existing id and a missing one.
const PARAM_VALUES = ["1", "999999"];

const ROLES = ["USER", "AGENT", "LANDLORD", "SALES", "ADMIN", "SUPERADMIN"];

const app = express();
app.use(express.json());
mountApiRoutes(app);
app.use(errorHandler);

const getRoutes = [];
for (const [prefix, router] of apiRoutes) {
  for (const layer of router.stack) {
    if (!layer.route?.methods.get) continue;
    const key = `GET ${prefix}${layer.route.path}`;
    if (!getRoutes.includes(key)) getRoutes.push(key);
  }
}

const cases = [];
for (const key of getRoutes) {
  const path = key.split(" ")[1];
  const urls = /:\w+/.test(path) ? PARAM_VALUES.map((value) => path.replace(/:(\w+)/g, value)) : [path];
  for (const url of urls) {
    cases.push({ key, url });
    for (const query of QUERIES[key] ?? []) cases.push({ key, url: url + query });
  }
}

let token;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await Role.bulkCreate(ROLES.map((roleName, i) => ({ id: i + 1, roleName, active: true })));
  // Rows inserted with explicit ids do not advance the id sequence.
  await sequelize.query(`SELECT setval(pg_get_serial_sequence('roles', 'id'), 6)`);
  const user = await User.create({ email: "sweep@example.com", username: "sweep", roleId: 5, verified: true });
  await UserProfile.create({ userId: user.id });
  const apartment = await Apartment.create({ apartment_name: "Flat", agent_id: user.id });
  await Location.create({ apartment_id: apartment.id, city_town: "Nairobi", latitude: "-1.28", longitude: "36.82" });
  await Property.create({ apartment_name: "Plot", agent_id: user.id });
  await Market.create({ sellerId: user.id, product_name: "Chair", product_price: "10" });
  token = jwt.sign({ id: user.id, username: user.username, email: user.email, roleId: user.roleId }, process.env.JWT_TOKEN);
});

afterAll(async () => {
  await sequelize.close();
});

// Every other route, called with an empty body: a missing field must give a
// client error, never a crash, a timeout or a 500.
const writeCases = [];
for (const [prefix, router] of apiRoutes) {
  for (const layer of router.stack) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods).filter((m) => m !== "get")) {
      const path = `${prefix}${layer.route.path}`;
      const key = `${method.toUpperCase()} ${path}`;
      for (const value of /:\w+/.test(path) ? PARAM_VALUES : [""]) {
        writeCases.push({ key, method, url: path.replace(/:(\w+)/g, value) });
      }
    }
  }
}

describe("GET sweep with a valid token", () => {
  it.each(cases)("$url", async ({ key, url }) => {
    const res = await request(app).get(url).set("authorization", `Bearer ${token}`).timeout(5000);

    const accepted = EXTERNAL.includes(key) ? [...ACCEPTED, 503] : ACCEPTED;
    expect(accepted).toContain(res.status);
  });
});

describe("POST, PUT and DELETE sweep with an empty body", () => {
  it.each(writeCases)("$method $url", async ({ key, method, url }) => {
    const res = await request(app)[method](url).set("authorization", `Bearer ${token}`).timeout(5000);

    if (EXTERNAL.includes(key) && res.status === 503) return;
    expect(res.status).toBeLessThan(500);
  });
});
