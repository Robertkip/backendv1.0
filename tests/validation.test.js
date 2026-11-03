import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import fs from "fs";
import os from "os";
import path from "path";

// Email delivery goes through RabbitMQ, an external service.
vi.mock("../src/rabbitmq/publisher.js", () => ({ publishEmailJob: vi.fn() }));

// Upload handlers save files under global.__basedir/Images.
global.__basedir = fs.mkdtempSync(path.join(os.tmpdir(), "waridi-test-"));
fs.mkdirSync(path.join(global.__basedir, "Images"));

const { sequelize } = await import("../src/config/connectDb.js");
const { apiRoutes, mountApiRoutes } = await import("../src/routers/index.js");
const { default: User } = await import("../src/models/authModel.js");
const { default: Message } = await import("../src/models/messageModel.js");
const { default: Market } = await import("../src/models/marketModel.js");

// POST and PUT routes that take no fields from the body.
const NO_BODY = [
  "POST /api/v1/cart/:productId",
  "POST /api/v1/verify-apartment/send-verification-code",
  "POST /api/v1/agent-documents",
  "POST /api/v1/posts/media",
];

const app = express();
app.use(express.json());
mountApiRoutes(app);

let user;
let other;
const auth = (req, who = user) =>
  req.set("authorization", `Bearer ${jwt.sign({ id: who.id, email: who.email, roleId: who.roleId }, process.env.JWT_TOKEN)}`);

beforeAll(async () => {
  await sequelize.sync({ force: true });
  user = await User.create({ email: "valid@example.com", username: "valid", roleId: 2, verified: true });
  other = await User.create({ email: "other@example.com", username: "other", roleId: 1, verified: true });
});

afterAll(async () => {
  await sequelize.close();
  fs.rmSync(global.__basedir, { recursive: true, force: true });
});

describe("request body validation", () => {
  it("covers every POST and PUT route that reads a body", () => {
    const unvalidated = [];
    for (const [prefix, router] of apiRoutes) {
      for (const layer of router.stack) {
        if (!layer.route) continue;
        for (const method of Object.keys(layer.route.methods).filter((m) => m === "post" || m === "put")) {
          const key = `${method.toUpperCase()} ${prefix}${layer.route.path}`;
          const validated = layer.route.stack.some((handler) => handler.handle.schema);
          if (!validated && !NO_BODY.includes(key)) unvalidated.push(key);
        }
      }
    }
    expect(unvalidated).toEqual([]);
  });

  it("answers 400 and names each invalid field", async () => {
    const res = await request(app)
      .post("/api/v1/signup")
      .send({ username: "", email: "not-an-email", password: "short", confirm_password: "other" });

    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field).sort()).toEqual(["confirm_password", "email", "password", "username"]);
  });

  it("drops fields the route does not accept", async () => {
    await auth(request(app).post("/api/v1/create-message")).send({
      receiverId: other.id,
      message: "Stripped",
      senderId: other.id,
      id: 999,
    });

    const message = await Message.findOne({ where: { message: "Stripped" } });
    expect(message.senderId).toBe(user.id);
    expect(message.id).not.toBe(999);
  });

  it("trims and converts form fields", async () => {
    const res = await auth(request(app).post("/api/v1/market"))
      .field("product_name", "  Sofa  ")
      .field("product_price", "1500")
      .field("product_quantity", "2");

    expect(res.status).toBe(201);
    const product = await Market.findOne({ where: { product_name: "Sofa" } });
    expect(product.product_price).toBe(1500);
    expect(product.product_quantity).toBe(2);
  });

  it.each([
    ["put", "/api/v1/cart/1", { action: "double" }],
    ["post", "/api/v1/location", { latitude: 200, longitude: 10 }],
    ["post", "/api/v1/rating", { itemId: "x", rating: 9 }],
    ["post", "/api/v1/friend", { receiverId: "abc" }],
    ["put", "/api/v1/agent-profile/1", {}],
    ["post", "/api/v1/send-notification", { body: "Hi", imageUrl: "not a url" }],
  ])("refuses %s %s with a bad body", async (method, url, body) => {
    const res = await auth(request(app)[method](url)).send(body);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid request body");
  });
});
