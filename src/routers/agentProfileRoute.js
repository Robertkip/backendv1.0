import express from "express";
import * as agentLocationController from "../controllers/agentLocationController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/agent-location", Authenticated, agentLocationController.createAgentLocation);
router.get("/agent-location/:id", Authenticated, agentLocationController.getSingleAgentLocation);
router.get("/agent-location", Authenticated, agentLocationController.getAgentLocations);
router.put("/agent-location/:id", Authenticated, agentLocationController.updateAgentLocation);
router.delete("/agent-location/:id", Authenticated, agentLocationController.deleteAgentLocation);

export default router;
