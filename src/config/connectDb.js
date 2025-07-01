import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from 'umzug'; // Import SequelizeStorage
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sequelize = new Sequelize({
  host: "localhost",
  username: "postgres",
  database: "waridi",
  password: "waridi123",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Create Umzug instance with proper configuration
export const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'migrations', '*.js'),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ // Use the built-in SequelizeStorage
    sequelize,
    modelName: 'migration_meta', // Customize if needed
  }),
  logger: console,
});

// Function to run pending migrations
export const runMigrations = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    // Get pending migrations
    const pending = await umzug.pending();
    if (pending.length === 0) {
      console.log("No pending migrations");
      return;
    }

    console.log(`Running ${pending.length} migrations...`);
    await umzug.up();
    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};
