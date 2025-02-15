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
exports.removeFileFromSpaces = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new aws_sdk_1.default.Endpoint(config_1.default.DO_SPACE_ENDPOINT);
const s3 = new aws_sdk_1.default.S3({
    endpoint: spacesEndpoint,
    accessKeyId: config_1.default.DO_SPACE_ACCESS_KEY,
    secretAccessKey: config_1.default.DO_SPACE_SECRET_KEY,
});
/**
 * Remove a file from DigitalOcean Spaces
 * @param fileUrl The full URL of the file to be deleted
 */
const removeFileFromSpaces = (fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fileUrl) {
        console.warn("File URL is empty, skipping deletion.");
        return;
    }
    try {
        // Extract the file key (filename) from the URL
        const urlParts = fileUrl.split("/");
        const fileKey = decodeURIComponent(urlParts[urlParts.length - 1]);
        if (!config_1.default.DO_SPACE_BUCKET) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "DigitalOcean Spaces bucket name is not configured.");
        }
        const params = {
            Bucket: config_1.default.DO_SPACE_BUCKET, // Name of the DigitalOcean Space
            Key: fileKey, // Extracted file name from the URL
        };
        // Attempt to delete the file
        yield s3.deleteObject(params).promise();
        console.log(`✅ File ${fileKey} deleted successfully from DigitalOcean Spaces.`);
    }
    catch (error) {
        console.error("❌ Error deleting file from DigitalOcean Spaces:", error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to delete file from storage.");
    }
});
exports.removeFileFromSpaces = removeFileFromSpaces;
