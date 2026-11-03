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
const { mountApiRoutes } = await import("../src/routers/index.js");
const { errorHandler } = await import("../src/middlewares/errorHandler.js");
const { default: User } = await import("../src/models/authModel.js");
const { default: NotificationToken } = await import("../src/models/notificationTokenModel.js");
const { default: Apartment } = await import("../src/models/apartmentModel.js");
const { default: Property } = await import("../src/models/propertyModel.js");
const { default: PropertyFiles } = await import("../src/models/propertyFilesModel.js");

const app = express();
app.use(express.json());
mountApiRoutes(app);
app.use(errorHandler);

let owner;
let attacker;
let admin;
const as = (who, req) =>
  req.set("authorization", `Bearer ${jwt.sign({ id: who.id, email: who.email, roleId: who.roleId }, process.env.JWT_TOKEN)}`);
const png = Buffer.from("89504e470d0a1a0a", "hex");

beforeAll(async () => {
  await sequelize.sync({ force: true });
  owner = await User.create({ email: "owner@example.com", username: "owner", roleId: 2, verified: true });
  attacker = await User.create({ email: "attacker@example.com", username: "attacker", roleId: 2, verified: true });
  admin = await User.create({ email: "admin@example.com", username: "admin", roleId: 5, verified: true });
});

afterAll(async () => {
  await sequelize.close();
  fs.rmSync(global.__basedir, { recursive: true, force: true });
});

describe("device tokens", () => {
  it("are registered for the logged-in user, whatever userId the body names", async () => {
    await as(attacker, request(app).post("/api/v1/token/store-device-token")).send({ userId: owner.id, deviceToken: "attacker-device" });

    const token = await NotificationToken.findOne({ where: { deviceToken: "attacker-device" } });
    expect(token.userId).toBe(attacker.id);
  });

  it("of another user are hidden from non-admins", async () => {
    await NotificationToken.create({ userId: owner.id, deviceToken: "owner-device" });

    const refused = await as(attacker, request(app).get(`/api/v1/token/?userId=${owner.id}`));
    const allowed = await as(admin, request(app).get(`/api/v1/token/?userId=${owner.id}`));

    expect(refused.status).toBe(403);
    expect(allowed.body.map((t) => t.deviceToken)).toEqual(["owner-device"]);
  });

  it("cannot be searched with SQL", async () => {
    const res = await as(admin, request(app).get("/api/v1/token/").query({ userId: "1' OR '1'='1" }));

    expect(res.status).toBe(400);
  });
});

describe("listing file uploads", () => {
  it("POST /apartment/addfiles is refused on someone else's apartment", async () => {
    const apartment = await Apartment.create({ apartment_name: "Mine", agent_id: owner.id });

    const res = await as(attacker, request(app).post("/api/v1/apartment/addfiles"))
      .attach("files", png, { filename: "a.png", contentType: "image/png" })
      .field("apartment_id", String(apartment.id));

    expect(res.status).toBe(403);
  });

  it("POST /property/addfiles links the files to the property for its owner only", async () => {
    const property = await Property.create({ apartment_name: "Plot", agent_id: owner.id });
    const upload = (who) =>
      as(who, request(app).post("/api/v1/property/addfiles"))
        .attach("files", png, { filename: "p.png", contentType: "image/png" })
        .field("property_id", String(property.id));

    const refused = await upload(attacker);
    const allowed = await upload(owner);

    expect(refused.status).toBe(403);
    expect(allowed.status).toBe(201);
    const files = await PropertyFiles.findOne({ where: { property_id: property.id } });
    expect(files.uploaded_by).toBe(owner.id);
  });
});

describe("connection requests", () => {
  it("are sent as the logged-in user", async () => {
    await as(attacker, request(app).post("/api/v1/send-connection-request")).send({
      currentUserId: owner.id,
      selectedUserId: admin.id,
    });

    expect((await User.findByPk(admin.id)).connectionsRequest).toEqual([attacker.id]);
    expect((await User.findByPk(owner.id)).connectionRequestSent ?? []).toEqual([]);
  });
});

describe("agent profile updates", () => {
  it("change the profile fields but never its verification", async () => {
    const { default: AgentProfile } = await import("../src/models/agentProfileModel.js");
    const profile = await AgentProfile.create({
      user_id: owner.id,
      agent_fname: "Old",
      agent_lname: "Name",
      agent_phonenumber: "0700000000",
      agent_idno: 1234,
    });

    const res = await as(owner, request(app).put(`/api/v1/agent-profile/${profile.id}`)).send({
      agent_fname: "New",
      agent_verified: "APPROVED",
      is_agent_verified: true,
    });

    await profile.reload();
    expect(res.status).toBe(200);
    expect(profile.agent_fname).toBe("New");
    expect(profile.agent_lname).toBe("Name");
    expect(profile.agent_verified).toBe("PENDING");
  });
});
