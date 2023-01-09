'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seller extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Seller.init({
    userId: DataTypes.INTEGER,
    seller_fname: DataTypes.STRING,
    seller_lname: DataTypes.STRING,
    seller_phonenumber: DataTypes.INTEGER,
    seller_locations: DataTypes.STRING,
    seller_id: DataTypes.INTEGER,
    seller_avatar: DataTypes.STRING,
    type: DataTypes.BLOB
  }, {
    sequelize,
    modelName: 'Seller',
  });
  return Seller;
};