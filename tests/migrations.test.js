import { describe, it, expect, beforeAll, afterAll } from "vitest";

const { sequelize, createMigrator } = await import("../src/config/connectDb.js");

const silent = { info() {}, warn() {}, error() {}, debug() {} };
const query = (sql) => sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

const columnExists = async (table, column) =>
  (await query(`SELECT 1 FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`)).length > 0;

const userIdTarget = async (table) =>
  (
    await query(`
      SELECT t.relname AS target FROM pg_constraint c
      JOIN pg_class s ON s.oid = c.conrelid
      JOIN pg_class t ON t.oid = c.confrelid
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
      WHERE c.contype = 'f' AND s.relname = '${table}' AND a.attname = 'user_id'`)
  ).map((row) => row.target);

beforeAll(async () => {
  await sequelize.getQueryInterface().dropAllTables();
});

afterAll(async () => {
  await sequelize.close();
});

describe("migrations", () => {
  it("create the whole schema on an empty database", async () => {
    await createMigrator(silent).up();

    const tables = await sequelize.getQueryInterface().showAllTables();
    expect(tables).toEqual(expect.arrayContaining(["users", "rental_apartments", "properties", "cartitems"]));
    expect(await createMigrator(silent).pending()).toEqual([]);
  });

  it("seed the roles with the ids the code uses", async () => {
    const roles = await query('SELECT id, "roleName" FROM roles ORDER BY id');

    expect(roles.map((role) => `${role.id} ${role.roleName}`)).toEqual([
      "1 USER", "2 AGENT", "3 LANDLORD", "4 SALES", "5 ADMIN", "6 SUPERADMIN",
    ]);
  });

  it("update a database created before the schema fixes", async () => {
    // The shape older databases have.
    await sequelize.query('DROP TABLE "SequelizeMeta"');
    await sequelize.query("ALTER TABLE cartitems DROP COLUMN quantity");
    await sequelize.query("ALTER TABLE properties DROP COLUMN agent_id");
    await sequelize.query("ALTER TABLE apartment_comments DROP CONSTRAINT apartment_comments_user_id_fkey");
    await sequelize.query(
      "ALTER TABLE apartment_comments ADD CONSTRAINT apartment_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES userprofiles (id)"
    );

    await createMigrator(silent).up();

    expect(await columnExists("cartitems", "quantity")).toBe(true);
    expect(await columnExists("properties", "agent_id")).toBe(true);
    expect(await userIdTarget("apartment_comments")).toEqual(["users"]);
    expect(await userIdTarget("agent_comments")).toEqual(["users"]);
  });
});
