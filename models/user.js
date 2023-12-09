'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    roleId: DataTypes.INTEGER,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    connections: DataTypes.INTEGER,
    phoneNumber: DataTypes.STRING,
    password: DataTypes.STRING,
    confirm_password: DataTypes.STRING,
    accessToken: DataTypes.TEXT,
    resetPasswordToken: DataTypes.TEXT,
    resetPasswordExpires: DataTypes.DATE,
    verified: DataTypes.BOOLEAN,
    active: DataTypes.BOOLEAN,
    type: DataTypes.BLOB
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};