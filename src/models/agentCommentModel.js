import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import AgentProfile from "./agentProfileModel.js";
import UserProfile from "./userProfileModel.js";


const AgentComment = sequelize.define('agent_comments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'userprofiles',
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

export default AgentComment;


AgentComment.associate = (models) => {
  AgentComment.belongsTo(AgentProfile, {
    foreignKey: "agent_id",
    as: "agent_profile",
  });

  AgentComment.belongsTo(UserProfile, {
    foreignKey: "user_id",
    as: "user",
  });
};

