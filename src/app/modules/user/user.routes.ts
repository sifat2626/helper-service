import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';
import { UserControllers } from './user.controller';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

router.post(
  '/register',
  validateRequest(UserValidations.registerUser),
  UserControllers.registerUser,
);

router.get(
  '/',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.getAllUsers,
);

router.get('/me', auth(UserRoleEnum.USER), UserControllers.getMyProfile);

router.get(
  '/:id',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.getSingleUser,
);
// router.put(
//   '/update-profile',
//   auth('USER', 'ADMIN'),
//   UserControllers.updateMyProfile,
// );
//

router.post(
  '/change-password',
  auth(UserRoleEnum.USER),
  UserControllers.changePassword,
);

router.post(
  '/change-role/:id/:role',
  auth(UserRoleEnum.SUPERADMIN, UserRoleEnum.ADMIN),
  UserControllers.changeRole,
);

export const UserRouters = router;
