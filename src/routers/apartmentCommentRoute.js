import express from "express";
import * as apartmentCommentController from "../controllers/apartmentCommentController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/apartment-comment", Authenticated, validateBody(schemas.createApartmentComment), apartmentCommentController.createApartmentComment);
router.get("/apartment-comment/:id", Authenticated, apartmentCommentController.getApartmentComments);
router.put("/apartment-comment/:id", Authenticated, validateBody(schemas.updateComment), apartmentCommentController.updateApartmentComment);
router.delete("/apartment-comment/:id", Authenticated, apartmentCommentController.deleteApartmentComment);

export default router;
