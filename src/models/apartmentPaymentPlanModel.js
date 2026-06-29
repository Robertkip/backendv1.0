import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDb.js";
import Apartment from "./apartmentModel.js";

const ApartmentPaymentPlan = sequelize.define("apartment_payment_plan", {
  apartment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
   unit_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pricing_amount: {
    type: DataTypes.STRING,
  },
  currency_type: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
  updateAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
});

export default ApartmentPaymentPlan;

ApartmentPaymentPlan.associate = (models) => {
  ApartmentPaymentPlan.belongsTo(models.Apartment, { foreignKey: "apartment_id" });
};

