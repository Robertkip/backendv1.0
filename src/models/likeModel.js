import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";

const Like = sequelize.define(
  "like",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "likes",
    freezeTableName: true,     // <-- ADD THIS
    timestamps: true,
  }
);

export default Like;
