"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelperRoutes = void 0;
const express_1 = __importDefault(require("express"));
const helper_controller_1 = require("./helper.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const uploadMiddleware_1 = require("../../utils/uploadMiddleware");
const router = express_1.default.Router();
router.post('/', 
// auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
uploadMiddleware_1.uploadMultipleMiddleware, 
// validateRequest(HelperValidation.createHelper),
helper_controller_1.HelperControllers.createHelper);
router.post('/upload-helper', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), uploadMiddleware_1.uploadMiddleware, helper_controller_1.HelperControllers.createHelpers);
router.get('/', 
// auth(UserRoleEnum.USER,UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),
helper_controller_1.HelperControllers.getAllHelpers);
//
router.post('/favorites/add/:maidId', (0, auth_1.default)(client_1.UserRoleEnum.USER), helper_controller_1.HelperControllers.addHelperToFavorites);
router.post('/favorites/remove/:maidId', (0, auth_1.default)(client_1.UserRoleEnum.USER), helper_controller_1.HelperControllers.removeHelperFromFavorites);
router.post('/book/:maidId', (0, auth_1.default)(client_1.UserRoleEnum.USER), helper_controller_1.HelperControllers.bookHelper);
router.put('/:id', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), uploadMiddleware_1.uploadMultipleMiddleware, helper_controller_1.HelperControllers.updateHelper);
router.delete('/:id', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), helper_controller_1.HelperControllers.deleteHelper);
exports.HelperRoutes = router;
