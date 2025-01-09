"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToDigitalOcean = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("../../config")); // Ensure your DigitalOcean credentials are in this config file
// Initialize the S3 client for DigitalOcean Spaces
const s3 = new aws_sdk_1.default.S3({
    endpoint: config_1.default.DO_SPACE_ENDPOINT, // e.g., 'https://nyc3.digitaloceanspaces.com'
    accessKeyId: config_1.default.DO_SPACE_ACCESS_KEY,
    secretAccessKey: config_1.default.DO_SPACE_SECRET_KEY,
});
const uploadFileToDigitalOcean = (file, folder) => {
    return new Promise((resolve, reject) => {
        // Define the upload parameters
        const params = {
            Bucket: config_1.default.DO_SPACE_BUCKET, // Name of your Space
            Key: `${folder}/${Date.now()}-${file.originalname}`, // Unique file path
            Body: file.buffer, // File data
            ContentType: file.mimetype, // File MIME type
            ACL: 'public-read', // Make the file publicly accessible
        };
        // Upload the file to the Space
        s3.upload(params, (err, data) => {
            if (err) {
                reject(new Error(`DigitalOcean Spaces upload failed: ${err.message}`));
            }
            else {
                resolve(data.Location); // Resolve with the file's URL
            }
        });
    });
};
exports.uploadFileToDigitalOcean = uploadFileToDigitalOcean;
