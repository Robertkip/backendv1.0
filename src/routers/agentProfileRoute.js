import express from "express";
import * as agentProfileController from "../controllers/agentProfileController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";
import { validateBody } from "../middlewares/validate.js";
import * as schemas from "../validation/schemas.js";

const router = express.Router();

router.post("/agent-profile", Authenticated, validateBody(schemas.createAgentProfile), agentProfileController.createAgentProfile);
router.get("/agent-profile/me", Authenticated, agentProfileController.getMyAgentProfile);
router.get("/agent-profile/:id", Authenticated, agentProfileController.getSingleAgentProfile);
router.get("/agent-profile", Authenticated, agentProfileController.getAgentProfiles);
router.put("/agent-profile/:id", Authenticated, validateBody(schemas.updateAgentProfile), agentProfileController.updateAgentProfile);
router.delete("/agent-profile/:id", Authenticated, agentProfileController.deleteAgentProfile);

export default router;
