import { sequelize } from "../config/connectDb.js";
import { DataTypes } from "sequelize";
import User from "./authModel.js";
import Like from "./likeModel.js";
import Post from "./postModel.js";

const UserProfile = sequelize.define("userprofile", {
  userId: {
    type: DataTypes.INTEGER,
  },
  user_fname: {
    type: DataTypes.STRING,
  },
  user_lname: {
    type: DataTypes.STRING,
  },
  user_location: {
    type: DataTypes.STRING,
  },
  user_phonenumber: {
    type: DataTypes.BIGINT,
  },
  user_avatar: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'https://api.waridi.co/images/userprofile.png',
  },
  type: {
    type: DataTypes.STRING,
  },

  followers: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },
  following: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },

  pendingConnections: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },
  acceptedConnections: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  },
  rejectedConnections: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    allowNull: true,
  }
});


UserProfile.associations = (models) => {
  UserProfile.belongsTo(User, {
    foreignKey: "userId",
  });
  return UserProfile;
};

export default UserProfile;


UserProfile.hasMany(Post, { foreignKey: 'authorId' });
UserProfile.belongsToMany(Post, { through: Like, foreignKey: 'userId' });

Post.belongsTo(UserProfile, { foreignKey: 'authorId' });

Post.belongsToMany(UserProfile, { through: Like, foreignKey: 'postId' });
