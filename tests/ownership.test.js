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
const { default: User } = await import("../src/models/authModel.js");
const { default: Role } = await import("../src/models/role.js");
const { default: UserProfile } = await import("../src/models/userProfileModel.js");
const { default: Apartment } = await import("../src/models/apartmentModel.js");
const { default: Property } = await import("../src/models/propertyModel.js");
const { default: Market } = await import("../src/models/marketModel.js");
const { default: Landlord } = await import("../src/models/landlordModel.js");
const { default: AgentProfile } = await import("../src/models/agentProfileModel.js");
const { default: AgentDocuments } = await import("../src/models/agentDocumentsModel.js");
const { default: AgentLocation } = await import("../src/models/agentLocationModel.js");
const { default: ApartmentComment } = await import("../src/models/apartmentCommentModel.js");
const { default: ApartmentPaymentPlan } = await import("../src/models/apartmentPaymentPlanModel.js");

const app = express();
app.use(express.json());
mountApiRoutes(app);

const ROLES = ["USER", "AGENT", "LANDLORD", "SALES", "ADMIN", "SUPERADMIN"];
const roleId = (name) => ROLES.indexOf(name) + 1;

let counter = 0;
const createUser = async (role = "USER") => {
  const n = ++counter;
  const user = await User.create({ email: `owner${n}@example.com`, username: `owner${n}`, roleId: roleId(role), verified: true });
  // Comments reference userprofiles.id with the user's id.
  await UserProfile.create({ id: user.id, userId: user.id });
  return user;
};

const tokenFor = (user) =>
  jwt.sign({ id: user.id, username: user.username, email: user.email, roleId: user.roleId }, process.env.JWT_TOKEN);

const send = (user, method, url, body = {}) =>
  request(app)[method](url).set("authorization", `Bearer ${tokenFor(user)}`).send(body);

const createAgentProfile = (user) =>
  AgentProfile.create({
    user_id: user.id,
    agent_fname: "Agent",
    agent_lname: "Smith",
    agent_phonenumber: "0700000000",
    agent_idno: 12345678,
  });

// Each entry creates a record owned by `owner` and lists the requests that
// change it. Only the owner or an admin may make them.
const resources = [
  {
    name: "apartment",
    create: async (owner) => (await Apartment.create({ apartment_name: "Flat", agent_id: owner.id })).id,
    requests: (id) => [["delete", `/api/v1/apartment/delete/${id}`]],
  },
  {
    name: "property",
    create: async (owner) => (await Property.create({ apartment_name: "Plot", agent_id: owner.id })).id,
    requests: (id) => [["delete", `/api/v1/property/delete/${id}`]],
  },
  {
    name: "market product",
    create: async (owner) => (await Market.create({ sellerId: owner.id })).id,
    requests: (id) => [["delete", `/api/v1/market/delete/${id}`]],
  },
  {
    name: "agent profile",
    create: async (owner) => (await createAgentProfile(owner)).id,
    requests: (id) => [
      ["put", `/api/v1/agent-profile/${id}`, { agent_description: "Updated" }],
      ["delete", `/api/v1/agent-profile/${id}`],
    ],
  },
  {
    name: "agent document",
    create: async (owner) => {
      const profile = await createAgentProfile(owner);
      return (await AgentDocuments.create({ agent_profile_id: profile.id })).id;
    },
    requests: (id) => [["delete", `/api/v1/agent-documents/${id}`]],
  },
  {
    name: "agent location",
    create: async (owner) => {
      const profile = await createAgentProfile(owner);
      const location = await AgentLocation.create({
        agent_profile_id: profile.id,
        agent_county: "Nairobi",
        agent_subcounty: "Westlands",
        agent_street: "Main",
      });
      return location.id;
    },
    requests: (id) => [
      ["put", `/api/v1/agent-location/${id}`, { agent_county: "Nairobi", agent_subcounty: "Kilimani", agent_street: "Second" }],
      ["delete", `/api/v1/agent-location/${id}`],
    ],
  },
  {
    name: "apartment comment",
    create: async (owner) => {
      const apartment = await Apartment.create({ apartment_name: "Flat" });
      return (await ApartmentComment.create({ content: "Nice", user_id: owner.id, apartment_id: apartment.id })).id;
    },
    requests: (id) => [
      ["put", `/api/v1/apartment-comment/${id}`, { content: "Edited" }],
      ["delete", `/api/v1/apartment-comment/${id}`],
    ],
  },
  {
    name: "apartment payment plan",
    create: async (owner) => {
      const apartment = await Apartment.create({ apartment_name: "Flat", agent_id: owner.id });
      return (await ApartmentPaymentPlan.create({ apartment_id: apartment.id, unit_type: 1 })).id;
    },
    requests: (id) => [
      ["put", `/api/v1/agent-payment/${id}`, { unit_type: 2 }],
      ["delete", `/api/v1/agent-payment/${id}`],
    ],
  },
];

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

for (const resource of resources) {
  describe(resource.name, () => {
    const cases = resource.requests(":id").map(([method, url, body]) => ({ method, url, body }));

    it.each(cases)("$method $url is refused for another user", async ({ method, url, body }) => {
      const id = await resource.create(owner);

      const res = await send(otherUser, method, url.replace(":id", id), body);

      expect(res.status).toBe(403);
    });

    it.each(cases)("$method $url is allowed for the owner", async ({ method, url, body }) => {
      const id = await resource.create(owner);

      const res = await send(owner, method, url.replace(":id", id), body);

      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(300);
    });

    it.each(cases)("$method $url is allowed for an admin", async ({ method, url, body }) => {
      const id = await resource.create(owner);

      const res = await send(admin, method, url.replace(":id", id), body);

      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(300);
    });
  });
}

describe("apartment owned through a landlord record", () => {
  it("can be deleted by the landlord's user", async () => {
    const landlordUser = await createUser("LANDLORD");
    const landlord = await Landlord.create({ userId: landlordUser.id });
    const apartment = await Apartment.create({ apartment_name: "Flat", landlord_id: landlord.id });

    const res = await send(landlordUser, "delete", `/api/v1/apartment/delete/${apartment.id}`);

    expect(res.status).toBe(200);
  });
});

describe("property without a recorded owner", () => {
  it("can be deleted by an admin only", async () => {
    const property = await Property.create({ apartment_name: "Plot" });

    const refused = await send(otherUser, "delete", `/api/v1/property/delete/${property.id}`);
    const allowed = await send(admin, "delete", `/api/v1/property/delete/${property.id}`);

    expect(refused.status).toBe(403);
    expect(allowed.status).toBe(200);
  });
});

describe("POST /property", () => {
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("records the logged-in user as the owner", async () => {
    // The non-production branch geocodes the address over the network.
    vi.stubEnv("NODE_ENV", "production");
    const png = Buffer.from("89504e470d0a1a0a", "hex");
    let req = request(app).post("/api/v1/property").set("authorization", `Bearer ${tokenFor(owner)}`);
    for (let i = 0; i < 4; i++) req = req.attach("images", png, { filename: `photo${i}.png`, contentType: "image/png" });

    const res = await req.field("apartment_name", "New plot");

    expect(res.status).toBeLessThan(300);
    const created = await Property.findOne({ where: { apartment_name: "New plot" } });
    expect(created.agent_id).toBe(owner.id);
  });
});

describe("user account changes", () => {
  it("refuses to change another user's password", async () => {
    const res = await send(otherUser, "put", `/api/v1/changepassword/${owner.id}`, { password: "Hijack1!", confirmPassword: "Hijack1!" });

    expect(res.status).toBe(403);
  });

  it("lets a user change their own password", async () => {
    const res = await send(owner, "put", `/api/v1/changepassword/${owner.id}`, { password: "NewPass1!", confirmPassword: "NewPass1!" });

    expect(res.status).toBe(200);
  });

  it("lets an admin change a user's password", async () => {
    const res = await send(admin, "put", `/api/v1/changepassword/${owner.id}`, { password: "Reset1!", confirmPassword: "Reset1!" });

    expect(res.status).toBe(200);
  });

  it("refuses to change another user's image", async () => {
    const res = await send(otherUser, "put", `/api/v1/user/${owner.id}`);

    expect(res.status).toBe(403);
  });

  it("refuses to update another user's profile", async () => {
    const res = await send(otherUser, "put", `/api/v1/updateprofile/?id=${owner.id}`);

    expect(res.status).toBe(403);
  });
});

describe("POST /role", () => {
  it("is refused for a non-admin", async () => {
    const res = await send(owner, "post", "/api/v1/role", { roleName: "HACKER" });

    expect(res.status).toBe(403);
  });
});
