"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helper_route_1 = require("../modules/helper/helper.route");
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_routes_1 = require("../modules/user/user.routes");
const service_route_1 = require("../modules/service/service.route");
const contact_route_1 = require("../modules/contact/contact.route");
const nationality_route_1 = require("../modules/nationality/nationality.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_routes_1.AuthRouters,
    },
    {
        path: '/users',
        route: user_routes_1.UserRouters,
    },
    {
        path: '/helpers',
        route: helper_route_1.HelperRoutes,
    },
    {
        path: '/services',
        route: service_route_1.ServiceRoutes,
    },
    {
        path: '/contact',
        route: contact_route_1.ContactRoutes,
    },
    {
        path: '/nationality',
        route: nationality_route_1.NationalityRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
