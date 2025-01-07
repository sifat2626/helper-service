import express from "express";
import validateRequest from '../../middlewares/validateRequest';
import { HelperValidation } from './helper.validation';
import { HelperControllers } from './helper.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

router.post(
  "/",
  auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),
  validateRequest(HelperValidation.createHelper),
  HelperControllers.createHelper,
);

router.get(
  "/",
  auth(UserRoleEnum.USER,UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),
  HelperControllers.getAllHelpers
);

router.post('/favorites/add/:maidId',auth(UserRoleEnum.USER),HelperControllers.addHelperToFavorites)

// router.put(
//   "/:id",
//   validate(helperValidation.updateHelper),
//   HelperControllers.updateHelper
// );
//
// router.get(
//   "/:id",
//   validate(helperValidation.getHelperById),
//   HelperControllers.getHelperById
// );
//
// router.delete(
//   "/:id",
//   validate(helperValidation.deleteHelper),
//   HelperControllers.deleteHelper
// );

export const HelperRoutes = router;
