import express from "express";
import * as apartmentPaymentController from "../controllers/apartmentPaymentController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/agent-payment", Authenticated, validateBody(schemas.createPaymentPlan), apartmentPaymentController.createApartmentPaymentPlan);
router.get("/agent-payment/:id", Authenticated, apartmentPaymentController.getSingleApartmentPaymentPlan);
router.get("/agent-payment", Authenticated, apartmentPaymentController.getApartmentPaymentPlans);
router.put("/agent-payment/:id", Authenticated, validateBody(schemas.updatePaymentPlan), apartmentPaymentController.updateApartmentPaymentPlan);
router.delete("/agent-payment/:id", Authenticated, apartmentPaymentController.deleteApartmentPaymentPlan);

export default router;
