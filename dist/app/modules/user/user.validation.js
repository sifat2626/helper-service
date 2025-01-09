"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = void 0;
const zod_1 = __importDefault(require("zod"));
const registerUser = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string({
            required_error: "Name is required!",
        }),
        email: zod_1.default
            .string({
            required_error: "Email is required!",
        })
            .email({
            message: "Invalid email format!",
        }),
        password: zod_1.default.string({
            required_error: "Password is required!",
        }),
    }),
});
const updateProfileSchema = zod_1.default.object({
    body: zod_1.default.object({
        age: zod_1.default
            .number()
            .int({
            message: "Age must be an integer!",
        })
            .optional(),
        bio: zod_1.default
            .string({
            required_error: "Bio is required!",
        })
            .optional(),
        lastDonationDate: zod_1.default
            .string({
            required_error: "Last donation date is required!",
        })
            .optional(),
    }),
});
exports.UserValidations = { registerUser, updateProfileSchema };
