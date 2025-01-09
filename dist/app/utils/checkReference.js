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
exports.isDataReferenced = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const isDataReferenced = (model, idField, idValue, referencingModels) => __awaiter(void 0, void 0, void 0, function* () {
    for (const reference of referencingModels) {
        // @ts-ignore
        const count = yield prisma_1.default[reference.model].count({
            where: {
                [reference.field]: idValue,
            },
        });
        if (count > 0) {
            console.log(`Data from model ${model} is referenced in ${reference.model}.${reference.field}.`);
            return true;
        }
    }
    return false;
});
exports.isDataReferenced = isDataReferenced;
