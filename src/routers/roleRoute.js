import express from "express";
import * as RoleController from "../controllers/roleController.js";
import * as Authorization from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/role",Authorization.Authenticated,  Authorization.AdminRole,  RoleController.CreateRole)

export default router;
