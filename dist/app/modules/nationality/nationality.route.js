"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NationalityRoutes = void 0;
const express_1 = __importDefault(require("express"));
const nationality_controller_1 = require("./nationality.controller");
const router = express_1.default.Router();
router.get('/', nationality_controller_1.NationalityControllers.getAllUniqueNationalities);
exports.NationalityRoutes = router;
