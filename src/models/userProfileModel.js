import { sequelize } from "../config/connectDb.js";
import { DataTypes } from "sequelize";
import User from "./authModel.js";
import Like from "./likeModel.js";
import Post from "./postModel.js";
import Comment from "./commentModel.js";

const UserProfile = sequelize.define(
  "userprofile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    user_fname: DataTypes.STRING,
    user_lname: DataTypes.STRING,
    user_location: DataTypes.STRING,
    user_phonenumber: DataTypes.BIGINT,
    user_avatar: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "https://api.waridi.org/images/userprofile.png",
    },
    type: DataTypes.STRING,

    followers: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    following: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    pendingConnections: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    acceptedConnections: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    rejectedConnections: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
  },
  {
    tableName: "userprofiles",  // EXACT table name
    freezeTableName: true,      // DO NOT pluralize/capitalize
    timestamps: true,
  }
);

// Correct associations
UserProfile.belongsTo(User, { foreignKey: "userId" });

UserProfile.hasMany(Post, { foreignKey: "authorId" });

UserProfile.belongsToMany(Post, {
  through: Like,
  foreignKey: "userId",
});

UserProfile.hasMany(Comment, {
  foreignKey: "authorId",
  as: "comments"
});

Comment.belongsTo(UserProfile, { foreignKey: "authorId", as: "author" });

Post.belongsTo(UserProfile, {
  foreignKey: "authorId",
});

Post.belongsToMany(UserProfile, {
  through: Like,
  foreignKey: "postId",
});

export default UserProfile;
