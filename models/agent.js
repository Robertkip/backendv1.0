'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Agent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Agent.init({
    userId: DataTypes.INTEGER,
    agent_fname: DataTypes.STRING,
    agent_lname: DataTypes.STRING,
    agent_idno: DataTypes.INTEGER,
    agent_phonenumber: DataTypes.INTEGER,
    agent_location: DataTypes.STRING,
    agent_avatar: DataTypes.STRING,
    type: DataTypes.BLOB
  }, {
    sequelize,
    modelName: 'Agent',
  });
  return Agent;
};