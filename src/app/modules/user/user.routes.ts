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

// router.get('/', UserControllers.getAllUsers);
//
// router.get('/me', auth('USER', 'ADMIN'), UserControllers.getMyProfile);
//
// router.get('/:id', UserControllers.getUserDetails);
// router.put(
//   '/update-profile',
//   auth('USER', 'ADMIN'),
//   UserControllers.updateMyProfile,
// );
//
// router.put(
//   '/update-user/:id',
//   auth('ADMIN'),
//   UserControllers.updateUserRoleStatus,
// );
//
// router.post(
//   '/change-password',
//   auth('USER', 'ADMIN'),
//   UserControllers.changePassword,
// );

router.post('/change-role/:id/:role',auth(UserRoleEnum.SUPERADMIN,UserRoleEnum.ADMIN),UserControllers.changeRole);

export const UserRouters = router;
