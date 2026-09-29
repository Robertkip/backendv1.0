import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from 'umzug'; // Import SequelizeStorage
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';
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

export const runMigrations = async() => {
    try {
        await sequelize.authenticate();
        console.log("Database connection established");

        // migrations/ is gitignored, so a fresh clone has no migration files.
        // Fall back to creating any missing tables from the Sequelize models.
        const migrationsDir = path.join(__dirname, '../../migrations');
        const hasMigrations = fs.existsSync(migrationsDir) &&
            fs.readdirSync(migrationsDir).some((file) => file.endsWith('.cjs'));
        if (!hasMigrations) {
            console.log("No migration files found, syncing tables from models");
            await sequelize.sync();
            return;
        }

        const queryInterface = sequelize.getQueryInterface();
        const umzug = new Umzug({
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
                queryInterface,
                Sequelize,
            },
            storage: new SequelizeStorage({ sequelize }),
            logger: console,
        });

        await umzug.up();

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