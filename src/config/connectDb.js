import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from 'umzug'; // Import SequelizeStorage
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

export const sequelize = new Sequelize({
    host: "62.171.172.146",
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



export const runMigrations = async() => {
    try {
        await sequelize.authenticate();
        console.log("Database connection established");

        await sequelize.sync({ force: true });

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