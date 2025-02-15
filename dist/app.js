"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./app/routes"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3001',
        'http://localhost:3000',
        'https://isabelyano-maid-finder.vercel.app',
    ],
    credentials: true,
}));
//parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.get('/', (req, res) => {
    res.send({
        Message: 'The server is running. . .',
    });
});
app.use('/api/v1', routes_1.default);
app.use(globalErrorHandler_1.default);
app.use((req, res, next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: 'API NOT FOUND!',
        error: {
            path: req.originalUrl,
            message: 'Your requested path is not found!',
        },
    });
});
exports.default = app;
