import { User, UserRoleEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}

const registerUserIntoDB = async (payload: any) => {
  // Hash the user's password
  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  // Ensure the role is always set to USER during registration
  if (payload.role && payload.role !== UserRoleEnum.USER) {
    throw new AppError(400, 'Users can only be registered with the USER role.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(400, 'User already exists');
  }

  // Prepare user data
  const userData = {
    name: payload.name,
    email: payload.email,
    role: UserRoleEnum.USER, // Role is always USER during registration
    password: hashedPassword,
  };

  // Create the user
  const createdUser = await prisma.user.create({
    data: userData,
  });

  return createdUser;
};

const getAllUsersFromDB = async (filter:any) => {

  const result = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};
//
// const getMyProfileFromDB = async (id: string) => {
//   const Profile = await prisma.user.findUniqueOrThrow({
//     where: {
//       id: id,
//     },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       createdAt: true,
//       updatedAt: true,
//       profile: true,
//     },
//   });
//
//   return Profile;
// };
//
// const getUserDetailsFromDB = async (id: string) => {
//   const user = await prisma.user.findUniqueOrThrow({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       createdAt: true,
//       updatedAt: true,
//       profile: true,
//     },
//   });
//   return user;
// };
//
// const updateMyProfileIntoDB = async (id: string, payload: any) => {
//   const userProfileData = payload.Profile;
//   delete payload.Profile;
//
//   const userData = payload;
//
//   // update user data
//   await prisma.$transaction(async (transactionClient: any) => {
//     // Update user data
//     const updatedUser = await transactionClient.user.update({
//       where: { id },
//       data: userData,
//     });
//
//     // Update user profile data
//     const updatedUserProfile = await transactionClient.Profile.update({
//       where: { userId: id },
//       data: userProfileData,
//     });
//
//     return { updatedUser, updatedUserProfile };
//   });
//
//   // Fetch and return the updated user including the profile
//   const updatedUser = await prisma.user.findUniqueOrThrow({
//     where: { id },
//     include: { profile: true },
//   });
//
//   const userWithOptionalPassword = updatedUser as UserWithOptionalPassword;
//   delete userWithOptionalPassword.password;
//
//   return userWithOptionalPassword;
// };
//
// const updateUserRoleStatusIntoDB = async (id: string, payload: any) => {
//   const result = await prisma.user.update({
//     where: {
//       id: id,
//     },
//     data: payload,
//   });
//   return result;
// };
//
// const changePassword = async (user: any, payload: any) => {
//   const userData = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: user.email,
//       status: 'ACTIVATE',
//     },
//   });
//
//   const isCorrectPassword: boolean = await bcrypt.compare(
//     payload.oldPassword,
//     userData.password,
//   );
//
//   if (!isCorrectPassword) {
//     throw new Error('Password incorrect!');
//   }
//
//   const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);
//
//   await prisma.user.update({
//     where: {
//       id: userData.id,
//     },
//     data: {
//       password: hashedPassword,
//     },
//   });
//
//   return {
//     message: 'Password changed successfully!',
//   };
// };

const changeRole = async (
  userId: string,
  targetUserId: string,
  role: string,
) => {
  return prisma.$transaction(
    async prisma => {
      // Check if the current user has sufficient permissions
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      console.log(currentUser);

      if (!currentUser) {
        throw new AppError(
          403,
          'You do not have permission to perform this action.',
        );
      }

      if (
        currentUser.role !== UserRoleEnum.SUPERADMIN &&
        currentUser.role !== UserRoleEnum.ADMIN
      ) {
        throw new AppError(
          403,
          'You do not have permission to perform this action.',
        );
      }

      // Check if the target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        throw new AppError(400, 'Target user does not exist.');
      }

      // Validate the role
      const validRoles = Object.values(UserRoleEnum); // Get all valid roles from the enum
      if (!validRoles.includes(role as UserRoleEnum)) {
        throw new AppError(400, 'Invalid role specified.');
      }

      // Prevent assigning SUPERADMIN role (if necessary)
      if (role === UserRoleEnum.SUPERADMIN) {
        throw new AppError(403, 'You cannot assign the SUPERADMIN role.');
      }

      // Update the target user's role
      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: role as UserRoleEnum },
      });

      return updatedUser;
    },
    {
      timeout: 10000, // Increase timeout to 10 seconds (10000 ms)
    },
  );
};

export const UserServices = {
  registerUserIntoDB,
  // getAllUsersFromDB,
  // getMyProfileFromDB,
  // getUserDetailsFromDB,
  // updateMyProfileIntoDB,
  // updateUserRoleStatusIntoDB,
  // changePassword,
  changeRole,
};
