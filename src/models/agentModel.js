import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb";

const Agent = sequelize.define('Agent', {
    agent_fname: {
        type: DataTypes.STRING,
    },
    agent_lname: {
        type: DataTypes.STRING,
    },
    agent_number: {
        type: DataTypes.INTEGER,
    },
    agent_idno: {
        type: DataTypes.INTEGER,
    },
    agent_avatar: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.BLOB
    },
});

export default Agent;
