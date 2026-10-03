import ApartmentPaymentPlan from "../models/apartmentPaymentPlanModel.js";
import Apartment from "../models/apartmentModel.js";
import { canModifyApartment, isAdmin, sendForbidden } from "../helpers/ownership.js";

// A payment plan belongs to whoever owns its apartment.
const canModifyPaymentPlan = async (user, paymentPlan) => {
  const apartment = await Apartment.findByPk(paymentPlan.apartment_id);
  return apartment ? canModifyApartment(user, apartment) : isAdmin(user);
};

export const createApartmentPaymentPlan = async (req, res) => {
  try {

    const { apartment_id, unit_type, plan_description, pricing_amount, plan_duration, currency_type } = req.body;

    const newPaymentPlan = await ApartmentPaymentPlan.create({
      apartment_id,
      unit_type,
      plan_description,
      pricing_amount,
      plan_duration,
      currency_type
    });

    return res.status(201).json(newPaymentPlan);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getApartmentPaymentPlans = async (req, res) => {
  try {
    const paymentPlans = await ApartmentPaymentPlan.findAll();
    return res.status(200).json(paymentPlans);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};  

export const getSingleApartmentPaymentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentPlan = await ApartmentPaymentPlan.findByPk(id);

    if (!paymentPlan) {
      return res.status(404).json({ message: "Payment plan not found" });
    }

    return res.status(200).json(paymentPlan);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateApartmentPaymentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_type, plan_description, pricing_amount, plan_duration, currency_type } = req.body;

    const paymentPlan = await ApartmentPaymentPlan.findByPk(id);

    if (!paymentPlan) {
      return res.status(404).json({ message: "Payment plan not found" });
    }
    if (!(await canModifyPaymentPlan(req.user, paymentPlan))) {
      return sendForbidden(res);
    }

    await paymentPlan.update({
      unit_type,
      plan_description,
      pricing_amount,
      plan_duration,
      currency_type
    });

    return res.status(200).json(paymentPlan);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteApartmentPaymentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentPlan = await ApartmentPaymentPlan.findByPk(id);

    if (!paymentPlan) {
      return res.status(404).json({ message: "Payment plan not found" });
    }
    if (!(await canModifyPaymentPlan(req.user, paymentPlan))) {
      return sendForbidden(res);
    }

    await paymentPlan.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
