import express from "express"
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import { ServiceControllers } from './service.controller';
import { ServiceValidation } from './service.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router()

router.post("/",auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),validateRequest(ServiceValidation.createServiceValidation),ServiceControllers.createService)
router.get("/",ServiceControllers.getAllServices)

export const ServiceRoutes = router