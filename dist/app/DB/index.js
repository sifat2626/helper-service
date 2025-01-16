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
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const superAdminData = {
    name: 'Super Admin',
    email: 'admin@gmail.com',
    phone: config_1.default.super_admin_phone,
    password: config_1.default.super_admin_password,
    role: client_1.UserRoleEnum.SUPERADMIN,
};
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if a super admin already exists
        const isSuperAdminExists = yield prisma_1.default.user.findFirst({
            where: {
                role: client_1.UserRoleEnum.SUPERADMIN,
            },
        });
        // If not, create one
        if (!isSuperAdminExists) {
            superAdminData.password = yield bcrypt.hash(config_1.default.super_admin_password, Number(config_1.default.bcrypt_salt_rounds) || 12);
            yield prisma_1.default.user.create({
                data: superAdminData,
            });
            console.log('Super Admin created successfully.');
        }
        else {
            return;
            //   console.log("Super Admin already exists.");
        }
    }
    catch (error) {
        console.error('Error seeding Super Admin:', error);
    }
});
exports.default = seedSuperAdmin;
