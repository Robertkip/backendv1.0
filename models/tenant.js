'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tenant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tenant.init({
    userId: DataTypes.INTEGER,
    logentId: DataTypes.STRING,
    tenant_fname: DataTypes.STRING,
    tenant_lname: DataTypes.STRING,
    tenent_location: DataTypes.STRING,
    tenant_idno: DataTypes.INTEGER,
    tenant_phonenumber: DataTypes.INTEGER,
    tenant_avatar: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tenant',
  });
  return Tenant;
};