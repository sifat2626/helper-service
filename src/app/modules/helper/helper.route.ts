import express from "express";
import validateRequest from '../../middlewares/validateRequest';
import { HelperValidation } from './helper.validation';
import { HelperControllers } from './helper.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import { uploadMiddleware, uploadMultipleMiddleware } from '../../utils/uploadMiddleware';

const router = express.Router();

router.post(
  "/",
  auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),
  uploadMultipleMiddleware,
  // validateRequest(HelperValidation.createHelper),
  HelperControllers.createHelper,
);

router.post("/upload-helper",auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),uploadMiddleware,HelperControllers.createHelpers)

router.get(
  "/",
  auth(UserRoleEnum.USER,UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),
  HelperControllers.getAllHelpers
);
//
router.post('/favorites/add/:maidId',auth(UserRoleEnum.USER),HelperControllers.addHelperToFavorites)
router.post('/book/:maidId',auth(UserRoleEnum.USER),HelperControllers.bookHelper)

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
router.delete(
  "/:id",
  HelperControllers.deleteHelper
);

export const HelperRoutes = router;
