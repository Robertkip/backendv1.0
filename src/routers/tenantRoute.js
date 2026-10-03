import express from 'express';
import * as tenantController from '../controllers/tenantController.js';
import { Authenticated } from '../middlewares/authorizationPermission.js';

const router = express.Router();

router.post('/tenant', Authenticated, tenantController.upload, tenantController.registerTenant);
router.get('/alltenant', Authenticated, tenantController.getAllTenant);
router.get('/tenant/:id', Authenticated, tenantController.getTenantByPK);

router.get('/tenantuser/:userId', Authenticated, tenantController.getSingleTenant);


export default router;
