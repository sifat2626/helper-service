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

  // Prevent users from setting themselves as SUPERADMIN or ADMIN
  if (
    payload.role === UserRoleEnum.SUPERADMIN ||
    payload.role === UserRoleEnum.ADMIN
  ) {
    throw new AppError(400, 'You cannot set yourself as an admin');
  }

  const userData = {
    name: payload.name,
    email: payload.email,
    role: payload.role,
    password: hashedPassword,
  };

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (prisma) => {
    // Step 1: Create the User
    const createdUser = await prisma.user.create({
      data: userData,
    });

    // Step 2: Create the associated Employer or Maid record based on the role
    if (payload.role === 'EMPLOYER') {
      await prisma.employer.create({
        data: {
          phone: payload.phone,
          countryCode: payload.countryCode,
          userId: createdUser.id, // Link to the created user
        },
      });
    } else if (payload.role === 'MAID') {
      await prisma.maid.create({
        data: {
          age: payload.age,
          nationality: payload.nationality,
          experience: payload.experience,
          languages: payload.languages,
          photo: payload.photo,
          biodataUrl: payload.biodataUrl,
          availability: payload.availability,
          userId: createdUser.id, // Link to the created user
        },
      });
    }

    // Step 3: Return the created user
    return createdUser;
  });

  return result;
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
