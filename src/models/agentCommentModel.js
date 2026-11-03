import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import AgentProfile from "./agentProfileModel.js";
import User from "./authModel.js";


const AgentComment = sequelize.define('agent_comments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // The commenter's users.id (what the controllers store).
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: AgentProfile,
      key: 'id',
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
});

AgentComment.belongsTo(AgentProfile, {
  foreignKey: "agent_id",
  as: "agent_profile",
});

AgentComment.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default AgentComment;

