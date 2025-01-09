"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelperValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createHelper = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default
            .string({
            required_error: "Name is required!",
        })
            .min(2, { message: "Name must be at least 2 characters long!" }),
        email: zod_1.default
            .string({
            required_error: "Email is required!",
        })
            .email({ message: "Email must be a valid email address!" }),
        age: zod_1.default
            .number({
            required_error: "Age is required!",
        })
            .min(18, { message: "Age must be at least 18!" }),
        experience: zod_1.default
            .number({
            required_error: "Experience is required!",
        })
            .min(0, { message: "Experience must be a positive number!" }),
        serviceName: zod_1.default
            .string({
            required_error: "Service name is required!",
        })
            .min(2, { message: "Service name must be at least 2 characters long!" }),
        photo: zod_1.default
            .string()
            .url({ message: "Photo must be a valid URL!" })
            .optional(),
        biodataUrl: zod_1.default
            .string()
            .url({ message: "Biodata URL must be a valid URL!" })
            .optional(),
        availability: zod_1.default.boolean().optional(),
    }),
});
const updateHelper = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default
            .string()
            .min(2, { message: "Name must be at least 2 characters long!" })
            .optional(),
        email: zod_1.default
            .string()
            .email({ message: "Email must be a valid email address!" })
            .optional(),
        age: zod_1.default
            .number()
            .min(18, { message: "Age must be at least 18!" })
            .optional(),
        experience: zod_1.default
            .number()
            .min(0, { message: "Experience must be a positive number!" })
            .optional(),
        serviceName: zod_1.default
            .string()
            .min(2, { message: "Service name must be at least 2 characters long!" })
            .optional(),
        photo: zod_1.default
            .string()
            .url({ message: "Photo must be a valid URL!" })
            .optional(),
        biodataUrl: zod_1.default
            .string()
            .url({ message: "Biodata URL must be a valid URL!" })
            .optional(),
        availability: zod_1.default.boolean().optional(),
    }),
    params: zod_1.default.object({
        id: zod_1.default.string({
            required_error: "Helper ID is required!",
        }),
    }),
});
const getHelperById = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({
            required_error: "Helper ID is required!",
        }),
    }),
});
const deleteHelper = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({
            required_error: "Helper ID is required!",
        }),
    }),
});
exports.HelperValidation = {
    createHelper,
    updateHelper,
    getHelperById,
    deleteHelper,
};
