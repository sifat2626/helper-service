import express from 'express';
import { HelperRoutes } from '../modules/helper/helper.route';
import { AuthRouters } from '../modules/auth/auth.routes';
import { UserRouters } from '../modules/user/user.routes';
import { ServiceRoutes } from '../modules/service/service.route';
import { ContactRoutes } from '../modules/contact/contact.route';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/helpers',
    route: HelperRoutes,
  },
  {
    path: '/services',
    route: ServiceRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
