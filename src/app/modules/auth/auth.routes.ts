import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from './auth.controller';
import { authValidation } from './auth.validation';
import { UserControllers } from '../user/user.controller';
const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser,
);

router.post('/send-otp', UserControllers.sendOtpForPasswordReset);
router.post('/verify-otp', UserControllers.verifyOtpAndResetPassword);

export const AuthRouters = router;
