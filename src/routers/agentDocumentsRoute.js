import express from "express";
import * as agentDocumentsController from "../controllers/agentDocumentsController.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";

const router = express.Router();

router.post("/agent-documents", Authenticated, agentDocumentsController.createAgentDocument);
router.get("/agent-documents/:id", Authenticated, agentDocumentsController.getAgentDocuments);
router.get("/agent-documents", Authenticated, agentDocumentsController.getSingleAgentDocument);
router.delete("/agent-documents/:id", Authenticated, agentDocumentsController.deleteAgentDocument);

export default router;
