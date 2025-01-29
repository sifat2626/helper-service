"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendEmail_1 = require("../../utils/sendEmail");
const registerUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Hash the user's password
    const hashedPassword = yield bcrypt.hash(payload.password, 12);
    // Ensure the role is always set to USER during registration
    if (payload.role && payload.role !== client_1.UserRoleEnum.USER) {
        throw new AppError_1.default(400, 'Users can only be registered with the USER role.');
    }
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (existingUser) {
        throw new AppError_1.default(400, 'User already exists');
    }
    // Prepare user data
    const userData = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: client_1.UserRoleEnum.USER, // Role is always USER during registration
        password: hashedPassword,
    };
    // Create the user
    const createdUser = yield prisma_1.default.user.create({
        data: userData,
    });
    return createdUser;
});
const getAllUsersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findMany({
        include: {
            favorites: true
        }
    });
    return result;
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
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
        throw new AppError_1.default(400, 'User not found');
    }
    return user;
});
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
const changePassword = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    const isCorrectPassword = yield bcrypt.compare(payload.oldPassword, userData.password);
    if (!isCorrectPassword) {
        throw new Error('Password incorrect!');
    }
    const hashedPassword = yield bcrypt.hash(payload.newPassword, 12);
    yield prisma_1.default.user.update({
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
});
const changeRole = (userId, targetUserId, role) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if the current user has sufficient permissions
        const currentUser = yield prisma.user.findUnique({
            where: { id: userId },
        });
        console.log(currentUser);
        if (!currentUser) {
            throw new AppError_1.default(403, 'You do not have permission to perform this action.');
        }
        if (currentUser.role !== client_1.UserRoleEnum.SUPERADMIN &&
            currentUser.role !== client_1.UserRoleEnum.ADMIN) {
            throw new AppError_1.default(403, 'You do not have permission to perform this action.');
        }
        // Check if the target user exists
        const targetUser = yield prisma.user.findUnique({
            where: { id: targetUserId },
        });
        if (!targetUser) {
            throw new AppError_1.default(400, 'Target user does not exist.');
        }
        // Validate the role
        const validRoles = Object.values(client_1.UserRoleEnum); // Get all valid roles from the enum
        if (!validRoles.includes(role)) {
            throw new AppError_1.default(400, 'Invalid role specified.');
        }
        // Prevent assigning SUPERADMIN role (if necessary)
        if (role === client_1.UserRoleEnum.SUPERADMIN) {
            throw new AppError_1.default(403, 'You cannot assign the SUPERADMIN role.');
        }
        // Update the target user's role
        const updatedUser = yield prisma.user.update({
            where: { id: targetUserId },
            data: { role: role },
        });
        return updatedUser;
    }), {
        timeout: 10000, // Increase timeout to 10 seconds (10000 ms)
    });
});
const sendOtpForPasswordReset = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError_1.default(404, 'User with this email does not exist');
    }
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash the OTP
    const hashedOtp = yield bcrypt.hash(otp, 10);
    // Set OTP expiration (e.g., 2 minutes)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    // Save OTP in the database
    yield prisma_1.default.passwordReset.upsert({
        where: { email },
        update: { otp: hashedOtp, expiresAt, isUsed: false }, // ensure OTP is not used
        create: { email, otp: hashedOtp, expiresAt, isUsed: false }, // ensure OTP is not used
    });
    // Send OTP via email
    yield (0, sendEmail_1.sendEmail)(email, 'Password Reset OTP', `Your OTP is ${otp}. It is valid for 2 minutes.`);
    return { message: 'OTP sent to your email' };
});
const verifyOtpAndResetPassword = (email, otp, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const passwordReset = yield prisma_1.default.passwordReset.findUnique({
        where: { email },
    });
    if (!passwordReset) {
        throw new AppError_1.default(400, 'Invalid or expired OTP');
    }
    // Check if the OTP is expired
    if (passwordReset.expiresAt < new Date()) {
        throw new AppError_1.default(400, 'OTP has expired');
    }
    // Check if the OTP has already been used
    if (passwordReset.isUsed) {
        throw new AppError_1.default(400, 'OTP has already been used');
    }
    // Verify the OTP
    const isOtpValid = yield bcrypt.compare(otp, passwordReset.otp);
    if (!isOtpValid) {
        throw new AppError_1.default(400, 'Invalid OTP');
    }
    // Update the user's password
    const hashedPassword = yield bcrypt.hash(newPassword, 10);
    yield prisma_1.default.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    // Mark OTP as used
    yield prisma_1.default.passwordReset.update({
        where: { email },
        data: { isUsed: true },
    });
    // Delete the OTP record after successful password reset
    yield prisma_1.default.passwordReset.delete({ where: { email } });
    return { message: 'Password reset successfully' };
});
exports.UserServices = {
    registerUserIntoDB,
    getAllUsersFromDB,
    getSingleUser,
    changePassword,
    changeRole,
    sendOtpForPasswordReset,
    verifyOtpAndResetPassword,
};
