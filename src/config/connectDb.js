import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from 'umzug'; // Import SequelizeStorage
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

export const sequelize = new Sequelize({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || "postgres",
    database: process.env.DATABASE_NAME || "waridi",
    password: process.env.DATABASE_PASSWORD,
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Migrations live in migrations/*.cjs and run in file-name order; the ones
// already applied are recorded in the SequelizeMeta table.
export const createMigrator = (logger = console) =>
    new Umzug({
        migrations: {
            glob: path.join(__dirname, '../../migrations/*.cjs'),
            resolve: ({ name, path: migrationPath, context }) => {
                const migration = require(migrationPath);
                return {
                    name,
                    up: async () => migration.up(context.queryInterface, context.Sequelize),
                    down: async () => migration.down(context.queryInterface, context.Sequelize),
                };
            },
        },
        context: {
            queryInterface: sequelize.getQueryInterface(),
            Sequelize,
        },
        storage: new SequelizeStorage({ sequelize }),
        logger,
    });

export const runMigrations = async() => {
    try {
        await sequelize.authenticate();
        console.log("Database connection established");

        await createMigrator().up();

        console.log("All migrations completed successfully");
    } catch (error) {
        console.error("Migration error:", error);
        process.exit(1);
    }
};

// Test database connection
export const testConnection = async() => {
    try {
        await sequelize.authenticate();
        console.log("Database connection established successfully");
    } catch (error) {
        console.error("Unable to connect to database:", error);
    }
};