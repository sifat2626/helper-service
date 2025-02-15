"use strict";
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
exports.UserControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const user_service_1 = require("./user.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const pickValidFields_1 = __importDefault(require("../../utils/pickValidFields"));
const registerUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email, password, whatsappNo, additionalRequest, preferredService, duration } = req.body;
    const result = yield user_service_1.UserServices.registerUserIntoDB(name, phone, email, password, whatsappNo, additionalRequest, preferredService, duration);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        message: 'User registered successfully',
        data: result,
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = (0, pickValidFields_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = yield user_service_1.UserServices.getAllUsersFromDB(options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        message: 'Users Retrieve successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const result = yield user_service_1.UserServices.getSingleUser(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Profile retrieved successfully',
        data: result,
    });
}));
const getSingleUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield user_service_1.UserServices.getSingleUser(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Profile retrieved successfully',
        data: result,
    });
}));
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield user_service_1.UserServices.changePassword(user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Password changed successfully',
        data: result,
    });
}));
const changeRole = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { id, role } = req.params;
    const result = yield user_service_1.UserServices.changeRole(userId, id, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Role changed successfully',
        data: result,
    });
}));
const sendOtpForPasswordReset = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const result = yield user_service_1.UserServices.sendOtpForPasswordReset(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: result.message,
        data: result,
    });
}));
const verifyOtpAndResetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, newPassword } = req.body;
    const result = yield user_service_1.UserServices.verifyOtpAndResetPassword(email, otp, newPassword);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: result.message,
        data: result,
    });
}));
exports.UserControllers = {
    registerUser,
    getAllUsers,
    getMyProfile,
    getSingleUser,
    changePassword,
    changeRole,
    sendOtpForPasswordReset,
    verifyOtpAndResetPassword
};
