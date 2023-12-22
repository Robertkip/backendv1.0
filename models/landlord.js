'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Landlord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Landlord.init({
    userId: DataTypes.INTEGER,
    landlord_fname: DataTypes.STRING,
    landlord_idno: DataTypes.STRING,
    landlord_phonenumber: DataTypes.STRING,
    landlord_location: DataTypes.STRING,
    landlord_avatar: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Landlord',
  });
  return Landlord;
};