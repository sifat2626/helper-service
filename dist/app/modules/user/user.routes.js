"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouters = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const user_controller_1 = require("./user.controller");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post('/register', (0, validateRequest_1.default)(user_validation_1.UserValidations.registerUser), user_controller_1.UserControllers.registerUser);
router.get('/', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), user_controller_1.UserControllers.getAllUsers);
router.get('/me', (0, auth_1.default)(client_1.UserRoleEnum.USER, client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), user_controller_1.UserControllers.getMyProfile);
router.get('/:id', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), user_controller_1.UserControllers.getSingleUser);
router.post('/change-password', (0, auth_1.default)(client_1.UserRoleEnum.USER, client_1.UserRoleEnum.SUPERADMIN, client_1.UserRoleEnum.ADMIN), user_controller_1.UserControllers.changePassword);
router.post('/change-role/:id/:role', (0, auth_1.default)(client_1.UserRoleEnum.SUPERADMIN, client_1.UserRoleEnum.ADMIN), user_controller_1.UserControllers.changeRole);
exports.UserRouters = router;
