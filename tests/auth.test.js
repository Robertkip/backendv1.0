import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import express from "express";
import request from "supertest";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Email delivery goes through RabbitMQ, an external service.
vi.mock("../src/rabbitmq/publisher.js", () => ({ publishEmailJob: vi.fn() }));

const { sequelize } = await import("../src/config/connectDb.js");
const { default: authRouter } = await import("../src/routers/authRoute.js");
const { default: User } = await import("../src/models/authModel.js");
const { default: Role } = await import("../src/models/role.js");
const { default: Otp } = await import("../src/models/otpModel.js");
const { default: AgentProfile } = await import("../src/models/agentProfileModel.js");

const app = express();
app.use(express.json());
app.use("/api/v1", authRouter);

const ROLES = ["USER", "AGENT", "LANDLORD", "SALES", "ADMIN", "SUPERADMIN"];
const roleId = (name) => ROLES.indexOf(name) + 1;

let counter = 0;
const uniqueEmail = () => `user${++counter}@example.com`;

const createUser = async ({ password = "Passw0rd!", hashed = true, role = "USER", verified = true } = {}) => {
  const email = uniqueEmail();
  return User.create({
    email,
    username: email.split("@")[0],
    password: hashed ? bcryptjs.hashSync(password, 8) : password,
    roleId: roleId(role),
    verified,
  });
};

const signup = (body) =>
  request(app)
    .post("/api/v1/signup")
    .send({ username: `new${++counter}`, email: uniqueEmail(), password: "Passw0rd!", confirm_password: "Passw0rd!", ...body });

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await Role.bulkCreate(ROLES.map((roleName, i) => ({ id: i + 1, roleName, active: true })));
});

afterAll(async () => {
  await sequelize.close();
});

describe("POST /signup", () => {
  it.each(["SALES", "ADMIN", "SUPERADMIN"])("does not let a new user pick the %s role", async (role) => {
    const res = await signup({ roleId: roleId(role) });

    expect(res.status).toBe(201);
    const user = await User.findByPk(res.body.user.id);
    expect(user.roleId).toBe(roleId("USER"));
  });

  it.each(["AGENT", "LANDLORD"])("lets a new user sign up as %s", async (role) => {
    const res = await signup({ roleId: roleId(role) });

    expect(res.status).toBe(201);
    const user = await User.findByPk(res.body.user.id);
    expect(user.roleId).toBe(roleId(role));
  });

  it("ignores verified and active sent in the request body", async () => {
    const res = await signup({ verified: true, active: true });

    expect(res.status).toBe(201);
    const user = await User.findByPk(res.body.user.id);
    expect(user.verified).toBe(false);
    expect(user.active).toBe(false);
  });
});

describe("POST /signin", () => {
  it("rejects the stored password hash used as the password", async () => {
    const user = await createUser();

    const res = await request(app).post("/api/v1/signin").send({ email: user.email, password: user.password });

    expect(res.status).toBe(401);
  });

  it("does not put the password hash in the login token", async () => {
    const user = await createUser({ password: "Passw0rd!" });

    const res = await request(app).post("/api/v1/signin").send({ email: user.email, password: "Passw0rd!" });

    expect(res.status).toBe(200);
    const payload = jwt.decode(res.body.token);
    expect(payload.id).toBe(user.id);
    expect(payload).not.toHaveProperty("password");
    expect(payload).not.toHaveProperty("confirm_password");
  });

  it("logs in a legacy plain-text password and stores it hashed", async () => {
    const user = await createUser({ password: "legacy-pass", hashed: false });

    const res = await request(app).post("/api/v1/signin").send({ email: user.email, password: "legacy-pass" });

    expect(res.status).toBe(200);
    const stored = await User.scope("withPassword").findByPk(user.id);
    expect(bcryptjs.compareSync("legacy-pass", stored.password)).toBe(true);
  });
});

describe("POST /verify-agent-login", () => {
  it("does not put the password hash in the agent login token", async () => {
    const user = await createUser({ role: "AGENT" });
    await AgentProfile.create({
      user_id: user.id,
      agent_fname: "Agent",
      agent_lname: "Smith",
      agent_phonenumber: "0700000000",
      agent_idno: 12345678,
      agent_verified: "APPROVED",
      is_agent_verified: true,
    });
    await Otp.create({ email: user.email, code: "123456", expireIn: new Date(Date.now() + 60000), purpose: "agent_login" });

    const res = await request(app).post("/api/v1/verify-agent-login").send({ email: user.email, code: "123456" });

    expect(res.status).toBe(200);
    const payload = jwt.decode(res.body.token);
    expect(payload.id).toBe(user.id);
    expect(payload).not.toHaveProperty("password");
    expect(payload).not.toHaveProperty("confirm_password");
  });
});

describe("user lookups", () => {
  // These routes require login.
  const getAsLoggedInUser = async (url, query = {}) => {
    const viewer = await createUser();
    const token = jwt.sign({ id: viewer.id, roleId: viewer.roleId }, process.env.JWT_TOKEN);
    return request(app).get(url).query(query).set("authorization", `Bearer ${token}`);
  };

  it("GET /users does not return password fields", async () => {
    await createUser();

    const res = await getAsLoggedInUser("/api/v1/users");

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const user of res.body) {
      expect(user).not.toHaveProperty("password");
      expect(user).not.toHaveProperty("confirm_password");
      expect(user).not.toHaveProperty("accessToken");
    }
  });

  it("GET /get-single-user does not return password fields", async () => {
    const user = await createUser();

    const res = await getAsLoggedInUser(`/api/v1/get-single-user?id=${user.id}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const found of res.body) {
      expect(found).not.toHaveProperty("password");
      expect(found).not.toHaveProperty("confirm_password");
      expect(found).not.toHaveProperty("accessToken");
    }
  });

  it("GET /get-single-user returns only the user with that exact id", async () => {
    // Make sure ids 10 and 11 exist, which contain the digit 1.
    while ((await User.max("id")) < 11) await createUser();

    const res = await getAsLoggedInUser("/api/v1/get-single-user?id=1");

    expect(res.status).toBe(200);
    expect(res.body.map((u) => u.id)).toEqual([1]);
  });

  it("GET /get-single-user rejects an id that is not a number instead of running it as SQL", async () => {
    await createUser();
    await createUser();

    const res = await getAsLoggedInUser("/api/v1/get-single-user", { id: "999999%' OR 1=1 OR '1'='1" });

    expect(res.status).toBe(400);
  });
});
