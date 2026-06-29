import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Agent from "./agentModel.js";

const AgentNotification = sequelize.define("agent_notifications", {
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  notification_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  notification_message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

    createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },

  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
});

AgentNotification.associate = (models) => {
  AgentNotification.belongsTo(models.Agent, {
    foreignKey: "agent_id",
    as: "agent",
  });
};

export default AgentNotification;

 