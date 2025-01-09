"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const service_controller_1 = require("./service.controller");
const service_validation_1 = require("./service.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), (0, validateRequest_1.default)(service_validation_1.ServiceValidation.createServiceValidation), service_controller_1.ServiceControllers.createService);
router.get("/", service_controller_1.ServiceControllers.getAllServices);
router.put('/:id', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), service_controller_1.ServiceControllers.updateService); // Update service
router.delete('/:id', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN, client_1.UserRoleEnum.SUPERADMIN), service_controller_1.ServiceControllers.deleteService); // Delete service
exports.ServiceRoutes = router;
