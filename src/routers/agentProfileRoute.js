import express from "express";
import * as agentProfileController from "../controllers/agentProfileController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/agent-profile", Authenticated, agentProfileController.createAgentProfile);
router.get("/agent-profile/:id", Authenticated, agentProfileController.getSingleAgentProfile);
router.get("/agent-profile", Authenticated, agentProfileController.getAgentProfiles);
router.put("/agent-profile/:id", Authenticated, agentProfileController.updateAgentProfile);
router.delete("/agent-profile/:id", Authenticated, agentProfileController.deleteAgentProfile);

export default router;
