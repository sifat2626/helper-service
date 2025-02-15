import httpStatus from 'http-status';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import pickValidFields from '../../utils/pickValidFields';

const registerUser = catchAsync(async (req, res) => {
  const {name,phone,email,password,whatsappNo,additionalRequest,preferredService,duration} = req.body
  const result = await UserServices.registerUserIntoDB(name,phone,email,password,whatsappNo,additionalRequest,preferredService,duration);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const options = pickValidFields(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await UserServices.getAllUsersFromDB(options);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Users Retrieve successfully',
    meta:result.meta,
    data: result.data,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const id = req.user.id;
  const result = await UserServices.getSingleUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await UserServices.getSingleUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await UserServices.changePassword(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: result,
  });
});

const changeRole = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const {id,role} = req.params
  const result = await UserServices.changeRole(userId,id,role)

    sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Role changed successfully',
    data: result,
  });
})

const sendOtpForPasswordReset = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await UserServices.sendOtpForPasswordReset(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const verifyOtpAndResetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await UserServices.verifyOtpAndResetPassword(email, otp, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

export const UserControllers = {
  registerUser,
  getAllUsers,
  getMyProfile,
  getSingleUser,
  changePassword,
  changeRole,
  sendOtpForPasswordReset,
  verifyOtpAndResetPassword
};
