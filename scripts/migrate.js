// Runs database migrations from migrations/*.cjs.
//   node scripts/migrate.js          apply every pending migration
//   node scripts/migrate.js status   list applied and pending migrations
//   node scripts/migrate.js down     undo the last applied migration
import { sequelize, createMigrator } from "../src/config/connectDb.js";

const command = process.argv[2] || "up";
const migrator = createMigrator();

try {
  if (command === "up") {
    await migrator.up();
  } else if (command === "down") {
    await migrator.down();
  } else if (command === "status") {
    const executed = (await migrator.executed()).map((m) => m.name);
    const pending = (await migrator.pending()).map((m) => m.name);
    console.log("Applied:", executed.length ? executed.join(", ") : "none");
    console.log("Pending:", pending.length ? pending.join(", ") : "none");
  } else {
    throw new Error(`Unknown command "${command}". Use up, down or status.`);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
