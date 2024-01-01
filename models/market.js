'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Market extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Market.init({
    sellerId: DataTypes.INTEGER,
    product_quantity: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    product_description: DataTypes.STRING,
    product_price: DataTypes.INTEGER,
    type: DataTypes.STRING,
    product_image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Market',
  });
  return Market;
};