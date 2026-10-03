import { sequelize } from "../src/config/connectDb.js";

// Tests drop and recreate tables, so never let them touch a real database.
if (!sequelize.config.database.endsWith("_test")) {
  throw new Error(
    `Refusing to run tests against database "${sequelize.config.database}". ` +
      "Use a database whose name ends in _test (set TEST_DATABASE_NAME)."
  );
}
