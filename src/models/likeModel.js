import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import UserProfile from "./userProfileModel.js";
import Post from "./postModel.js";

const Like = sequelize.define('likes', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'userprofiles',
      key: 'id',
    },
    primaryKey: true,
  },
  postId: {
    type: DataTypes.UUID,
    references: {
      model: Post,
      key: 'id',
    },
    primaryKey: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Like;
