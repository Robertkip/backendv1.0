import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Apartment from "./apartmentModel.js";
import User from "./authModel.js";

const ApartmentComment = sequelize.define(
  "apartment_comments",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // The commenter's users.id (what the controllers store).
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    apartment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "rental_apartments",
        key: "id",
      },
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }
);

ApartmentComment.belongsTo(Apartment, {
  foreignKey: "apartment_id",
  as: "apartment",
});

ApartmentComment.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default ApartmentComment;
