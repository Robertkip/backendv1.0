import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Property from "./propertyModel.js";

const PropertyFiles = sequelize.define(
  "PropertyFiles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Property,
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
    tableName: "property_files",
    timestamps: true,
  }
);

PropertyFiles.associate = (models) => {
  PropertyFiles.belongsTo(models.Property, {
    foreignKey: "property_id",
    as: "property",
  });
};

export default PropertyFiles;
