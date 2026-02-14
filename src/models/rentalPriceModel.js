import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Apartment from "./apartmentModel.js";

const RentPricing = sequelize.define("rent_pricing", {
    unit_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rent_time_rate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    unit_rent_price: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    apartment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updateAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

export default RentPricing;


RentPricing.associations = (models) => {
    RentPricing.belongsTo(Apartment, {
        foreignKey: "apartment_id",
    });
    return RentPricing;
};