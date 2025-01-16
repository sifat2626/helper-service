"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
    super_admin_phone: process.env.SUPER_ADMIN_PHONE,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    sender_email: process.env.SenderEmail,
    sender_pass: process.env.SenderPass,
    DO_SPACE_ENDPOINT: process.env.DO_SPACE_ENDPOINT,
    DO_SPACE_ACCESS_KEY: process.env.DO_SPACE_ACCESS_KEY,
    DO_SPACE_SECRET_KEY: process.env.DO_SPACE_SECRET_KEY,
    DO_SPACE_BUCKET: process.env.DO_SPACE_BUCKET,
    jwt: {
        access_secret: process.env.JWT_ACCESS_SECRET,
        access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
        refresh_secret: process.env.JWT_REFRESH_SECRET,
        refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    },
};
