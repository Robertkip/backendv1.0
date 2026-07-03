import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import AgentProfile from "./agentProfileModel.js";


const AgentComment = sequelize.define('agent_comments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agentprofiles',
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
    as: "agent",
  });

};

