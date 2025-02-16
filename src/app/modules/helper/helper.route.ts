import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { HelperValidation } from './helper.validation';
import { HelperControllers } from './helper.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import {
  uploadMiddleware,
  uploadMultipleMiddleware,
} from '../../utils/uploadMiddleware';

const router = express.Router();

router.post(
  '/',
  // auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  uploadMultipleMiddleware,
  // validateRequest(HelperValidation.createHelper),
  HelperControllers.createHelper,
);

router.post(
  '/upload-helper',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  uploadMiddleware,
  HelperControllers.createHelpers,
);


router.get(
  '/',
  // auth(UserRoleEnum.USER,UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),
  HelperControllers.getAllHelpers,
);
//
router.post(
  '/favorites/add/:maidId',
  auth(UserRoleEnum.USER),
  HelperControllers.addHelperToFavorites,
);

router.post(
  '/favorites/remove/:maidId',
  auth(UserRoleEnum.USER),
  HelperControllers.removeHelperFromFavorites,
);

router.post(
  '/book/:maidId',
  auth(UserRoleEnum.USER),
  HelperControllers.bookHelper,
);

router.put(
  '/:id',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  uploadMultipleMiddleware,
  HelperControllers.updateHelper,
);

router.delete(
  '/:id',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  HelperControllers.deleteHelper,
);


export const HelperRoutes = router;
