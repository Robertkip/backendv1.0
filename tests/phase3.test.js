import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import express from "express";
import request from "supertest";

// Email delivery goes through RabbitMQ, an external service.
const publishEmailJob = vi.fn();
vi.mock("../src/rabbitmq/publisher.js", () => ({ publishEmailJob }));

const { sequelize } = await import("../src/config/connectDb.js");
const { mountApiRoutes } = await import("../src/routers/index.js");
const { missingEnv } = await import("../src/config/checkEnv.js");
const { createAuthRateLimit } = await import("../src/middlewares/rateLimit.js");
const { default: User } = await import("../src/models/authModel.js");
const { default: UserProfile } = await import("../src/models/userProfileModel.js");
const { default: Otp } = await import("../src/models/otpModel.js");

const app = express();
app.use(express.json());
mountApiRoutes(app);

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("configuration check", () => {
  it("requires the JWT secrets", () => {
    expect(missingEnv({})).toEqual(["JWT_TOKEN", "JWT_REFRESH_TOKEN"]);
    expect(missingEnv({ JWT_TOKEN: "a", JWT_REFRESH_TOKEN: " " })).toEqual(["JWT_REFRESH_TOKEN"]);
    expect(missingEnv({ JWT_TOKEN: "a", JWT_REFRESH_TOKEN: "b" })).toEqual([]);
  });

  it("requires the session secret and database password in production", () => {
    const env = { NODE_ENV: "production", JWT_TOKEN: "a", JWT_REFRESH_TOKEN: "b" };

    expect(missingEnv(env)).toEqual(["REDIS_SESSION_SECRET", "DATABASE_PASSWORD"]);
  });
});

describe("login rate limit", () => {
  it("answers 429 once a client goes over the limit", async () => {
    const limited = express();
    limited.post("/signin", createAuthRateLimit({ max: 2 }), (req, res) => res.send("ok"));

    const statuses = [];
    for (let i = 0; i < 3; i++) statuses.push((await request(limited).post("/signin")).status);

    expect(statuses).toEqual([200, 200, 429]);
  });
});

describe("signup when the email cannot be queued", () => {
  const body = {
    username: "queued",
    email: "queued@example.com",
    password: "Secret1!",
    confirm_password: "Secret1!",
  };

  it("saves nothing, so the same person can sign up again", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    publishEmailJob.mockRejectedValueOnce(new Error("RabbitMQ is down"));

    const failed = await request(app).post("/api/v1/signup").send(body);

    expect(failed.status).toBe(500);
    expect(await User.count({ where: { email: body.email } })).toBe(0);
    expect(await UserProfile.count()).toBe(0);
    expect(await Otp.count({ where: { email: body.email } })).toBe(0);

    const retried = await request(app).post("/api/v1/signup").send(body);

    expect(retried.status).toBe(201);
    expect(await User.count({ where: { email: body.email } })).toBe(1);
    vi.restoreAllMocks();
  });
});
