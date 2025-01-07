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
    throw new AppError(400, "Users can only be registered with the USER role.");
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

// const getAllUsersFromDB = async () => {
//   const result = await prisma.user.findMany({
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       status: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });
//
//   return result;
// };
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

export const UserServices = {
  registerUserIntoDB,
  // getAllUsersFromDB,
  // getMyProfileFromDB,
  // getUserDetailsFromDB,
  // updateMyProfileIntoDB,
  // updateUserRoleStatusIntoDB,
  // changePassword,
};
