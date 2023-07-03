import express from 'express';
import * as agentController from '../controllers/agentController.js';

const router = express.Router();

router.post('/agent', agentController.upload, agentController.registerAgent);
router.get('/allagent', agentController.getAllAgents);
router.get('/agent/:id', agentController.getAgentById);
router.get('/agentuser/:userId', agentController.getSingleAgent);
router.get('agentapartment/:apartmentId', agentController.getAllApartmentsByAgent);

export default router;
