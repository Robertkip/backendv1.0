import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import UserProfile from "./userProfileModel.js";
import Like from "./likeModel.js";

const Post = sequelize.define('posts', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'userprofiles', // Use table name as string
      key: 'id',
    },
  },
  originalPostId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'posts', // Already a string, no change needed
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

export default Post;

