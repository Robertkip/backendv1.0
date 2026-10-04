import express from "express";
import * as apartmentCommentController from "../controllers/apartmentCommentController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/apartment-comment", Authenticated, apartmentCommentController.createApartmentComment);
router.get("/apartment-comment/:id", Authenticated, apartmentCommentController.getApartmentComments);
router.put("/apartment-comment/:id", Authenticated, apartmentCommentController.updateApartmentComment);
router.delete("/apartment-comment/:id", Authenticated, apartmentCommentController.deleteApartmentComment);

export default router;
