'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Apartment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Apartment.init({
    logent_id: DataTypes.INTEGER,
    apartment_name: DataTypes.STRING,
    apartment_location: DataTypes.STRING,
    apartment_description: DataTypes.STRING,
    address: DataTypes.TEXT,
    latitude: DataTypes.DECIMAL,
    longitude: DataTypes.DECIMAL,
    type1: DataTypes.STRING,
    name1: DataTypes.STRING,
    data1: DataTypes.BLOB,
    type2: DataTypes.STRING,
    name2: DataTypes.STRING,
    data2: DataTypes.BLOB,
    type3: DataTypes.STRING,
    name3: DataTypes.STRING,
    data3: DataTypes.BLOB,
    type4: DataTypes.STRING,
    name4: DataTypes.STRING,
    data4: DataTypes.BLOB
  }, {
    sequelize,
    modelName: 'Apartment',
  });
  return Apartment;
};