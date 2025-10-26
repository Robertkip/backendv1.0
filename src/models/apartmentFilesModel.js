import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Apartment from "./apartmentModel.js";

const ApartmentFiles = sequelize.define(
  "ApartmentFiles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    apartment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Apartment,
        key: "id",
      },
    },
    first_image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: [/^(https?:\/\/|\/)/],
          msg: "First image must be a valid URL or file path",
        },
      },
    },
    second_image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: [/^(https?:\/\/|\/)/],
          msg: "Second image must be a valid URL or file path",
        },
      },
    },
    third_image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: [/^(https?:\/\/|\/)/],
          msg: "Third image must be a valid URL or file path",
        },
      },
    },
    fourth_image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: [/^(https?:\/\/|\/)/],
          msg: "Fourth image must be a valid URL or file path",
        },
      },
    },
    video_path: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: [/^(https?:\/\/|\/)/],
          msg: "Video path must be a valid URL or file path",
        },
      },
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "apartment_files",
    timestamps: true,
  }
);

ApartmentFiles.associate = (models) => {
  ApartmentFiles.belongsTo(models.Apartment, {
    foreignKey: "apartment_id",
    as: "apartment",
  });
};

export default ApartmentFiles;
