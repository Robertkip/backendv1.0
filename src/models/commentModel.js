import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Post from "./postModel.js";
import UserProfile from "./userProfileModel.js";

const Comment = sequelize.define('comments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'userprofiles',
      key: 'id',
    },
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Comment;
