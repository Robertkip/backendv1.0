import express from 'express';
import * as tenantController from '../controllers/tenantController.js';

const router = express.Router();

router.post('/tenant', tenantController.upload, tenantController.registerTenant);
router.get('/alltenant', tenantController.getAllTenant);
router.get('/tenant/:id', tenantController.getTenantByPK);

router.get('/tenantuser/:userId', tenantController.getSingleTenant);


export default router;
