"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouters = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const user_controller_1 = require("../user/user.controller");
const router = express_1.default.Router();
router.post('/login', (0, validateRequest_1.default)(auth_validation_1.authValidation.loginUser), auth_controller_1.AuthControllers.loginUser);
router.post('/send-otp', user_controller_1.UserControllers.sendOtpForPasswordReset);
router.post('/verify-otp', user_controller_1.UserControllers.verifyOtpAndResetPassword);
exports.AuthRouters = router;
