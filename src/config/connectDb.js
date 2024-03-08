import { Sequelize } from "sequelize";
import QueryTypes from "sequelize";
export const sequelize = new Sequelize({
  host: "localhost",
  username: "postgres",
  database: "waridi",
  password: "postgres123",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

sequelize.beforeSync();
async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection Has Been Established Successfully");
  } catch (error) {
    console.error("Unable To Connect To Database", error);
  }
};

export const test = async () => {
  sequelize
    .query("SELECT * FROM Apartment WHERE apartment_name = ?", {
      replacements: ["REPLACE_APARTMENT_NAME"],
      type: QueryTypes.SELECT,
    })
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.error("Failed to insert data : ", error);
    });
};
