import express from "express";
import * as agentLocationController from "../controllers/agentLocationController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/agent-profile", Authenticated, agentLocationController.createAgentLocation);
router.get("/agent-profile/:id", Authenticated, agentLocationController.getSingleAgentLocation);
router.get("/agent-profile", Authenticated, agentLocationController.getAgentLocations);
router.put("/agent-profile/:id", Authenticated, agentLocationController.updateAgentLocation);
router.delete("/agent-profile/:id", Authenticated, agentLocationController.deleteAgentLocation);

export default router;
