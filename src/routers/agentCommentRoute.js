import express from "express";
import * as agentCommentController from "../controllers/agentCommentController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";
const router = express.Router();

router.post("/agent-comment", Authenticated, agentCommentController.createAgentComment);
router.get("/agent-comment/:id", Authenticated, agentCommentController.getSingleAgentComment);
router.get("/agent-comments/:agentId", Authenticated, agentCommentController.getAgentComments);
router.put("/agent-comment/:id", Authenticated, agentCommentController.updateAgentComment);
router.delete("/agent-comment/:id", Authenticated, agentCommentController.deleteAgentComment);

export default router;
