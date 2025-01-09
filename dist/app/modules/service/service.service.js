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
exports.Services = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const checkReference_1 = require("../../utils/checkReference");
const createService = (service) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield prisma_1.default.service.findFirst({
        where: {
            name: service,
        }
    });
    if (exists) {
        throw new AppError_1.default(400, 'Service already exists');
    }
    const result = yield prisma_1.default.service.create({
        data: {
            name: service,
        }
    });
    return result;
});
const getAllServices = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = 10, page = 1 } = query;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;
    const result = yield prisma_1.default.service.findMany({
        skip: skip,
        take: take,
    });
    const meta = {
        total: result === null || result === void 0 ? void 0 : result.length,
        limit: limit,
        page: page,
        totalPages: Math.ceil(result.length / take),
    };
    return {
        meta,
        data: result
    };
});
const getServiceIdByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    let service = yield prisma_1.default.service.findFirst({
        where: {
            name: name
        }
    });
    if (!service) {
        service = yield createService(name);
    }
    return service.id;
});
const updateService = (id, name) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield prisma_1.default.service.findUnique({
        where: {
            id,
        },
    });
    if (!exists) {
        throw new AppError_1.default(404, 'Service not found');
    }
    const duplicate = yield prisma_1.default.service.findFirst({
        where: {
            name,
            NOT: {
                id,
            },
        },
    });
    if (duplicate) {
        throw new AppError_1.default(400, 'Service with this name already exists');
    }
    const updatedService = yield prisma_1.default.service.update({
        where: { id },
        data: { name },
    });
    return updatedService;
});
const deleteService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Define models and fields that reference the Service model
    const referencingModels = [
        { model: 'Maid', field: 'serviceId' }, // Maids reference the Service
    ];
    // Check if the Service is referenced in other models
    const isReferenced = yield (0, checkReference_1.isDataReferenced)('Service', 'id', id, referencingModels);
    if (isReferenced) {
        throw new AppError_1.default(400, 'Service cannot be deleted as it is referenced by other entities.');
    }
    // Proceed with deletion if not referenced
    yield prisma_1.default.service.delete({
        where: { id },
    });
    return { message: 'Service deleted successfully' };
});
exports.Services = {
    createService,
    getAllServices,
    getServiceIdByName,
    updateService,
    deleteService
};
