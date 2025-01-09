import httpStatus from 'http-status';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const registerUser = catchAsync(async (req, res) => {
  const result = await UserServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB()

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Users Retrieve successfully',
    data: result,
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
//
// const getUserDetails = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const result = await UserServices.getUserDetailsFromDB(id);
//
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'User details retrieved successfully',
//     data: result,
//   });
// });
//
// const updateMyProfile = catchAsync(async (req, res) => {
//   const id = req.user.id;
//   const result = await UserServices.updateMyProfileIntoDB(id, req.body);
//
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'User profile updated successfully',
//     data: result,
//   });
// });
//
// const updateUserRoleStatus = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const result = await UserServices.updateUserRoleStatusIntoDB(id, req.body);
//
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'User updated successfully',
//     data: result,
//   });
// });

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

export const UserControllers = {
  registerUser,
  getAllUsers,
  getMyProfile,
  getSingleUser,
  // updateMyProfile,
  // updateUserRoleStatus,
  changePassword,
  changeRole
};
