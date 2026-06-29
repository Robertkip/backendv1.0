import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

import AgentProfile from "./agentProfileModel.js";

const AgentDocuments = sequelize.define(
  "agent_documents",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    agent_profile_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Property,
        key: "id",
      },
    },
    agent_passport_photo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: [/^(https?:\/\/|\/)/],
          msg: "First image must be a valid URL or file path",
        },
      },
    },
    front_id_photo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: [/^(https?:\/\/|\/)/],
          msg: "Second image must be a valid URL or file path",
        },
      },
    },
    back_id_photo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: [/^(https?:\/\/|\/)/],
          msg: "Third image must be a valid URL or file path",
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
    tableName: "agent_documents",
    timestamps: true,
  }
);

AgentDocuments.associate = (models) => {
  AgentDocuments.belongsTo(models.AgentProfile, {
    foreignKey: "agent_profile_id",
    as: "agentProfile",
  });
};

export default AgentDocuments;
