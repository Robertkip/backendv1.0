import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import UserProfile from "./userProfileModel.js";

const Media = sequelize.define("media", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("image", "video", "other"),
    allowNull: false,
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "userprofiles",
      key: "id",
    },
  },
  usedInPost: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "media",
  timestamps: true,
});

Media.belongsTo(UserProfile, { foreignKey: "uploadedBy", as: "uploader" });

export default Media;

