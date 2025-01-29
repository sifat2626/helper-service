import { User, UserRoleEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';

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
    phone: payload.phone,
    role: UserRoleEnum.USER, // Role is always USER during registration
    password: hashedPassword,
  };

  // Create the user
  const createdUser = await prisma.user.create({
    data: userData,
  });

  return createdUser;
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    include:{
      favorites:true
    }
  });

  return result;
};

const getSingleUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      favorites: {
        include: {
          maid: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(400, 'User not found');
  }

  return user;
};
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

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Password incorrect!');
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: 'Password changed successfully!',
  };
};

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

const sendOtpForPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(404, 'User with this email does not exist');
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP
  const hashedOtp = await bcrypt.hash(otp, 10);

  // Set OTP expiration (e.g., 2 minutes)
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  // Save OTP in the database
  await prisma.passwordReset.upsert({
    where: { email },
    update: { otp: hashedOtp, expiresAt, isUsed: false }, // ensure OTP is not used
    create: { email, otp: hashedOtp, expiresAt, isUsed: false }, // ensure OTP is not used
  });

  // Send OTP via email
  await sendEmail(
    email,
    'Password Reset OTP',
    `Your OTP is ${otp}. It is valid for 2 minutes.`,
  );

  return { message: 'OTP sent to your email' };
};

const verifyOtpAndResetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const passwordReset = await prisma.passwordReset.findUnique({
    where: { email },
  });
  if (!passwordReset) {
    throw new AppError(400, 'Invalid or expired OTP');
  }

  // Check if the OTP is expired
  if (passwordReset.expiresAt < new Date()) {
    throw new AppError(400, 'OTP has expired');
  }

  // Check if the OTP has already been used
  if (passwordReset.isUsed) {
    throw new AppError(400, 'OTP has already been used');
  }

  // Verify the OTP
  const isOtpValid = await bcrypt.compare(otp, passwordReset.otp);
  if (!isOtpValid) {
    throw new AppError(400, 'Invalid OTP');
  }

  // Update the user's password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Mark OTP as used
  await prisma.passwordReset.update({
    where: { email },
    data: { isUsed: true },
  });

  // Delete the OTP record after successful password reset
  await prisma.passwordReset.delete({ where: { email } });

  return { message: 'Password reset successfully' };
};

export const UserServices = {
  registerUserIntoDB,
  getAllUsersFromDB,
  getSingleUser,
  changePassword,
  changeRole,
  sendOtpForPasswordReset,
  verifyOtpAndResetPassword,
};
