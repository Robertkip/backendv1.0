import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Apartment from "./apartmentModel.js";
import UserProfile from "./userProfileModel.js";

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

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "userprofiles",
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

ApartmentComment.belongsTo(UserProfile, {
  foreignKey: "user_id",
  as: "user",
});

export default ApartmentComment;
