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
exports.HelperControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const helper_service_1 = require("./helper.service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createHelper = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // Parse the body data from the form-data field named "data"
    const bodyData = JSON.parse(req.body.data);
    // Extract the first file from each field
    const photo = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image) === null || _b === void 0 ? void 0 : _b[0]; // Safely get the first image file
    let biodata = (_d = (_c = req.files) === null || _c === void 0 ? void 0 : _c.pdf) === null || _d === void 0 ? void 0 : _d[0]; // Safely get the first PDF file
    // Ensure both photo and biodata files are provided
    if (!photo) {
        return res.status(400).json({
            success: false,
            message: 'Photo is required.',
        });
    }
    // Call the service function
    const result = yield helper_service_1.HelperServices.createHelper(bodyData, photo, biodata);
    // Send the response
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        message: 'Maid Created',
        data: result,
    });
}));
const createHelpers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.file) {
        throw new AppError_1.default(400, 'File not found');
    }
    const helpers = [];
    const errors = [];
    const stream = req.file.buffer.toString('utf8');
    const csvRows = stream.split('\n');
    const headers = (_a = csvRows[0]) === null || _a === void 0 ? void 0 : _a.split(',').map(header => header.trim());
    // console.log(headers);
    if (!headers || headers.length < 1) {
        throw new AppError_1.default(400, 'Invalid CSV format.');
    }
    // process csv skipping the header
    for (let i = 1; i < csvRows.length; i++) {
        const row = csvRows[i].split(',');
        // console.log(row);
        if (row.length !== headers.length) {
            errors.push(`Row ${row.length} does not match the header`);
            continue;
        }
        const helper = headers.reduce((acc, header, index) => {
            var _a;
            acc[header] = (_a = row[index]) === null || _a === void 0 ? void 0 : _a.trim();
            return acc;
        }, {});
        // console.log(helper);
        if (!helper.name ||
            !helper.email ||
            !helper.age ||
            !helper.experience ||
            !helper.serviceName ||
            !helper.photo ||
            !helper.biodataUrl) {
            errors.push(`Row ${i + 1} is missing required fields.`);
            continue;
        }
        helpers.push(helper);
    }
    const serviceResult = yield helper_service_1.HelperServices.bulkCreateHelpers(helpers);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        message: `${serviceResult.successCount} helpers uploaded successfully.`,
        data: { errors: serviceResult.errors },
    });
}));
const getAllHelpers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield helper_service_1.HelperServices.getAllHelpers(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'helpers retrieved successfully',
        data: result,
    });
}));
const updateHelper = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params;
    // Validate and parse `req.body.data`
    if (!req.body.data) {
        throw new AppError_1.default(400, 'Data field is required.');
    }
    let helperData;
    try {
        helperData = JSON.parse(req.body.data);
    }
    catch (error) {
        throw new AppError_1.default(400, 'Invalid JSON format for data field.');
    }
    // Files from the request
    const photo = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image) === null || _b === void 0 ? void 0 : _b[0];
    const biodata = (_d = (_c = req.files) === null || _c === void 0 ? void 0 : _c.pdf) === null || _d === void 0 ? void 0 : _d[0];
    // Validate file types
    if (photo && !photo.mimetype.startsWith('image/')) {
        throw new AppError_1.default(400, 'Invalid file type for photo. Only images are allowed.');
    }
    if (biodata && biodata.mimetype !== 'application/pdf') {
        throw new AppError_1.default(400, 'Invalid file type for biodata. Only PDF files are allowed.');
    }
    // Call the service to update the helper
    const result = yield helper_service_1.HelperServices.updateHelper(id, helperData, photo, biodata);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Helper updated successfully.',
        data: result,
    });
}));
const deleteHelper = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield helper_service_1.HelperServices.deleteHelper(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.NO_CONTENT,
        message: 'helpers deleted successfully',
        data: result,
    });
}));
//
const addHelperToFavorites = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const maidId = req.params.maidId;
    const result = yield helper_service_1.HelperServices.addHelperToFavorites(userId, maidId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        message: 'added to favorites',
        data: result,
    });
}));
const removeHelperFromFavorites = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const maidId = req.params.maidId;
    const result = yield helper_service_1.HelperServices.removeHelperFromFavorites(userId, maidId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        message: 'removed from favorites',
        data: result,
    });
}));
const bookHelper = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const maidId = req.params.maidId;
    const result = yield helper_service_1.HelperServices.bookHelper(userId, maidId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        message: 'booked maid successfully',
        data: result,
    });
}));
exports.HelperControllers = {
    createHelper,
    createHelpers,
    getAllHelpers,
    updateHelper,
    deleteHelper,
    addHelperToFavorites,
    removeHelperFromFavorites,
    bookHelper
};
