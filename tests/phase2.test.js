import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import fs from "fs";
import os from "os";
import path from "path";

// Email delivery goes through RabbitMQ, an external service.
const publishEmailJob = vi.fn();
vi.mock("../src/rabbitmq/publisher.js", () => ({ publishEmailJob }));

// Upload handlers save files under global.__basedir/Images.
global.__basedir = fs.mkdtempSync(path.join(os.tmpdir(), "waridi-test-"));
fs.mkdirSync(path.join(global.__basedir, "Images"));

const { sequelize } = await import("../src/config/connectDb.js");
const { mountApiRoutes } = await import("../src/routers/index.js");
const { asyncHandler, errorHandler } = await import("../src/middlewares/errorHandler.js");
const { default: User } = await import("../src/models/authModel.js");
const { default: Role } = await import("../src/models/role.js");
const { default: Apartment } = await import("../src/models/apartmentModel.js");
const { default: Property } = await import("../src/models/propertyModel.js");
const { default: Market } = await import("../src/models/marketModel.js");
const { default: Message } = await import("../src/models/messageModel.js");
const { default: AgentProfile } = await import("../src/models/agentProfileModel.js");
const { default: Otp } = await import("../src/models/otpModel.js");

const app = express();
app.use(express.json());
mountApiRoutes(app);
app.use(errorHandler);

const ROLES = ["USER", "AGENT", "LANDLORD", "SALES", "ADMIN", "SUPERADMIN"];
const roleId = (name) => ROLES.indexOf(name) + 1;

let counter = 0;
const createUser = (role = "USER", fields = {}) => {
  const n = ++counter;
  return User.create({ email: `user${n}@example.com`, username: `user${n}`, roleId: roleId(role), verified: true, ...fields });
};

const tokenFor = (user) =>
  jwt.sign({ id: user.id, username: user.username, email: user.email, roleId: user.roleId }, process.env.JWT_TOKEN);

const send = (user, method, url, body) => {
  const req = request(app)[method](url).set("authorization", `Bearer ${tokenFor(user)}`);
  return body === undefined ? req : req.send(body);
};

let owner;
let otherUser;
let admin;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await Role.bulkCreate(ROLES.map((roleName, i) => ({ id: i + 1, roleName, active: true })));
  owner = await createUser("AGENT");
  otherUser = await createUser("AGENT");
  admin = await createUser("ADMIN");
});

afterAll(async () => {
  await sequelize.close();
  fs.rmSync(global.__basedir, { recursive: true, force: true });
});

beforeEach(() => {
  publishEmailJob.mockClear();
});

describe("error safety net", () => {
  const crashApp = express();
  crashApp.get("/boom", asyncHandler(async () => {
    throw new Error("boom");
  }));
  crashApp.get("/ok", (req, res) => res.send("ok"));
  crashApp.use(errorHandler);

  it("answers 500 when an async handler throws, and keeps serving", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const crashed = await request(crashApp).get("/boom");
    const next = await request(crashApp).get("/ok");

    expect(crashed.status).toBe(500);
    expect(crashed.body).toEqual({ message: "Internal server error" });
    expect(next.status).toBe(200);
    vi.restoreAllMocks();
  });
});

describe("forgot and reset password", () => {
  it("needs an email", async () => {
    const res = await request(app).post("/api/v1/forgotpassword").send({});

    expect(res.status).toBe(400);
  });

  it("gives the same answer for an unknown email and sends nothing", async () => {
    const res = await request(app).post("/api/v1/forgotpassword").send({ email: "nobody@example.com" });

    expect(res.status).toBe(200);
    expect(publishEmailJob).not.toHaveBeenCalled();
  });

  it("emails a code that resets the password", async () => {
    const user = await createUser("USER", { password: "old" });

    const forgot = await request(app).post("/api/v1/forgotpassword").send({ email: user.email });
    const otp = await Otp.findOne({ where: { email: user.email, purpose: "password_reset" } });
    const reset = await request(app)
      .post("/api/v1/resetpassword")
      .send({ email: user.email, code: otp.code, password: "NewPass1!", confirm_password: "NewPass1!" });
    const signin = await request(app).post("/api/v1/signin").send({ email: user.email, password: "NewPass1!" });

    expect(forgot.status).toBe(200);
    expect(publishEmailJob).toHaveBeenCalledOnce();
    expect(publishEmailJob.mock.calls[0][0].to).toBe(user.email);
    expect(reset.status).toBe(200);
    expect(signin.status).toBe(200);
  });

  it("refuses a wrong code", async () => {
    const user = await createUser("USER");
    await request(app).post("/api/v1/forgotpassword").send({ email: user.email });

    const res = await request(app)
      .post("/api/v1/resetpassword")
      .send({ email: user.email, code: "000000x", password: "Hijack1!", confirm_password: "Hijack1!" });

    expect(res.status).toBe(400);
  });
});

describe("profile updates without an uploaded file", () => {
  it("PUT /updateprofile/ updates the profile", async () => {
    const res = await send(owner, "put", `/api/v1/updateprofile/?id=${owner.id}`, { description: "Hello" });

    expect(res.status).toBe(201);
    expect((await User.findByPk(owner.id)).description).toBe("Hello");
  });

  it("PUT /user/:id updates the profile", async () => {
    const res = await send(owner, "put", `/api/v1/user/${owner.id}`, { description: "Again" });

    expect(res.status).toBe(200);
  });
});

describe("POST /property outside production", () => {
  it("creates the property once, without hard-coded LAN image URLs", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEVELOPMENT_IMAGE_URL", "http://localhost:8084/images/");
    vi.stubEnv("API_KEY", "");
    const png = Buffer.from("89504e470d0a1a0a", "hex");

    const res = await request(app)
      .post("/api/v1/property")
      .set("authorization", `Bearer ${tokenFor(owner)}`)
      .attach("images", png, { filename: "photo.png", contentType: "image/png" })
      .field("apartment_name", "Dev plot")
      .field("address", "Somewhere");

    vi.unstubAllEnvs();
    expect(res.status).toBe(201);
    const created = await Property.findOne({ where: { apartment_name: "Dev plot" } });
    expect(created.name1).toMatch(/^http:\/\/localhost:8084\/images\//);
  });
});

describe("routes that used to be shadowed or unreachable", () => {
  it("GET /property/agent/:agent_id lists that user's properties", async () => {
    await Property.create({ apartment_name: "Mine", agent_id: owner.id });

    const res = await send(owner, "get", `/api/v1/property/agent/${owner.id}`);

    expect(res.status).toBe(200);
    expect(res.body.apartments.map((p) => p.apartment_name)).toContain("Mine");
  });

  it("GET /apartmentaccount/:logent_id lists that user's apartments", async () => {
    await Apartment.create({ apartment_name: "Listed", agent_id: owner.id });

    const res = await request(app).get(`/api/v1/apartmentaccount/${owner.id}`);

    expect(res.status).toBe(200);
    expect(res.body.apartments.map((a) => a.apartment_name)).toContain("Listed");
  });

  it.each(["apartment", "property", "market"])("DELETE /%s/delete/all is reached by an admin", async (kind) => {
    const res = await send(admin, "delete", `/api/v1/${kind}/delete/all`);

    expect(res.status).toBe(200);
  });

  it("GET /apartment-comment/:id lists an apartment's comments", async () => {
    const apartment = await Apartment.create({ apartment_name: "Commented" });
    await send(owner, "post", "/api/v1/apartment-comment", { content: "Nice", apartment_id: apartment.id });

    const res = await send(otherUser, "get", `/api/v1/apartment-comment/${apartment.id}`);

    expect(res.status).toBe(200);
    expect(res.body.map((c) => c.content)).toEqual(["Nice"]);
  });
});

describe("cart", () => {
  it("PUT /cart/:id changes the quantity of the user's own item", async () => {
    const product = await Market.create({ product_name: "Lamp", product_price: 5 });
    await send(owner, "post", `/api/v1/cart/${product.id}`);
    const [item] = (await send(owner, "get", "/api/v1/allcart")).body;

    const res = await send(owner, "put", `/api/v1/cart/${item.id}`, { action: "increment" });
    const other = await send(otherUser, "put", `/api/v1/cart/${item.id}`, { action: "increment" });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(2);
    expect(other.status).toBe(404);
  });
});

describe("messages", () => {
  it("are sent as the logged-in user", async () => {
    await send(owner, "post", "/api/v1/create-message", { senderId: otherUser.id, receiverId: admin.id, message: "Hi" });

    const message = await Message.findOne({ where: { message: "Hi" } });
    expect(message.senderId).toBe(owner.id);
  });

  it("GET /get-messages/ needs both ids", async () => {
    const res = await send(owner, "get", "/api/v1/get-messages/");

    expect(res.status).toBe(400);
  });

  it("GET /get-messages/ refuses a conversation the user is not part of", async () => {
    const res = await send(owner, "get", `/api/v1/get-messages/?senderId=${otherUser.id}&receiverId=${admin.id}`);

    expect(res.status).toBe(403);
  });

  it("GET /get-messages/ returns the user's own conversation", async () => {
    const res = await send(owner, "get", `/api/v1/get-messages/?senderId=${owner.id}&receiverId=${admin.id}`);

    expect(res.status).toBe(200);
    expect(res.body.messages.map((m) => m.message)).toContain("Hi");
  });
});

describe("listing details (amenities, facilities, locations)", () => {
  const kinds = [
    { url: "/api/v1/apartment-facilities", parent: "apartment", body: { facility_name: "Water" } },
    { url: "/api/v1/apartment-properties", parent: "apartment", body: { number_of_units: "4" } },
    { url: "/api/v1/location/addlocation", parent: "apartment", body: { city_town: "Nairobi" } },
    { url: "/api/v1/property-facilities", parent: "property", body: { facility_name: "Fence" } },
    { url: "/api/v1/property-properties", parent: "property", body: { bedrooms: "3" } },
    { url: "/api/v1/property-locations", parent: "property", body: { city_town: "Nakuru" } },
  ];

  const createListing = async (kind) =>
    kind.parent === "apartment"
      ? { apartment_id: (await Apartment.create({ apartment_name: "A", agent_id: owner.id })).id }
      : { property_id: (await Property.create({ apartment_name: "P", agent_id: owner.id })).id };

  it.each(kinds)("$url can be created by the listing's owner only", async (kind) => {
    const parent = await createListing(kind);

    const refused = await send(otherUser, "post", kind.url, { ...kind.body, ...parent });
    const allowed = await send(owner, "post", kind.url, { ...kind.body, ...parent });

    expect(refused.status).toBe(403);
    expect(allowed.status).toBe(201);
  });

  it.each(kinds)("$url needs an existing listing", async (kind) => {
    const key = kind.parent === "apartment" ? "apartment_id" : "property_id";

    const missing = await send(owner, "post", kind.url, kind.body);
    const unknown = await send(owner, "post", kind.url, { ...kind.body, [key]: 999999 });

    expect(missing.status).toBe(400);
    expect(unknown.status).toBe(404);
  });

  it("can be changed and deleted by the owner and an admin, not by others", async () => {
    const parent = await createListing(kinds[0]);
    const { body } = await send(owner, "post", "/api/v1/apartment-facilities", { facility_name: "Gate", ...parent });
    const id = body.data.id;

    const refusedUpdate = await send(otherUser, "put", `/api/v1/apartment-facilities/${id}`, { facility_name: "X" });
    const refusedDelete = await send(otherUser, "delete", `/api/v1/apartment-facilities/${id}`);
    const update = await send(owner, "put", `/api/v1/apartment-facilities/${id}`, { facility_name: "Big gate" });
    const read = await request(app).get(`/api/v1/apartment-facilities/${id}`);
    const remove = await send(admin, "delete", `/api/v1/apartment-facilities/${id}`);

    expect(refusedUpdate.status).toBe(403);
    expect(refusedDelete.status).toBe(403);
    expect(update.status).toBe(200);
    expect(read.body.data.facility_name).toBe("Big gate");
    expect(remove.status).toBe(200);
  });

  it("cannot be moved onto someone else's listing", async () => {
    const mine = await createListing(kinds[0]);
    const theirs = await Apartment.create({ apartment_name: "Theirs", agent_id: otherUser.id });
    const { body } = await send(owner, "post", "/api/v1/apartment-facilities", { facility_name: "Pool", ...mine });

    const res = await send(owner, "put", `/api/v1/apartment-facilities/${body.data.id}`, { apartment_id: theirs.id });

    expect(res.status).toBe(403);
  });
});

describe("agent comments", () => {
  it("are listed for an agent with their author", async () => {
    const profile = await AgentProfile.create({
      user_id: owner.id,
      agent_fname: "Agent",
      agent_lname: "Smith",
      agent_phonenumber: "0700000000",
      agent_idno: 12345678,
    });
    await send(otherUser, "post", "/api/v1/agent-comment", { content: "Helpful", agent_id: profile.id });

    const res = await send(owner, "get", `/api/v1/agent-comments/${profile.id}`);

    expect(res.status).toBe(200);
    expect(res.body[0].content).toBe("Helpful");
    expect(res.body[0].user.username).toBe(otherUser.username);
  });
});

describe("agent documents", () => {
  it("are visible to their agent and admins only", async () => {
    const profile = await AgentProfile.create({
      user_id: owner.id,
      agent_fname: "Doc",
      agent_lname: "Owner",
      agent_phonenumber: "0711111111",
      agent_idno: 87654321,
    });

    const mine = await send(owner, "get", `/api/v1/agent-documents/${profile.id}`);
    const theirs = await send(otherUser, "get", `/api/v1/agent-documents/${profile.id}`);
    const asAdmin = await send(admin, "get", `/api/v1/agent-documents/${profile.id}`);

    expect(mine.status).toBe(200);
    expect(theirs.status).toBe(403);
    expect(asAdmin.status).toBe(200);
  });
});

describe("GET /rating/:itemId", () => {
  it("answers 0 when there are no ratings", async () => {
    const res = await send(owner, "get", "/api/v1/rating/no-ratings-yet");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ average: 0, count: 0 });
  });

  it("averages the ratings given", async () => {
    const itemId = `item-${Date.now()}`;
    await send(owner, "post", "/api/v1/rating", { itemId, rating: 4 });
    await send(otherUser, "post", "/api/v1/rating", { itemId, rating: 2 });

    const res = await send(owner, "get", `/api/v1/rating/${itemId}`);

    expect(res.body).toEqual({ average: 3, count: 2 });
  });
});
