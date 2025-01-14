import express from 'express';
import { NationalityControllers } from './nationality.controller';

const router = express.Router();

router.get('/',NationalityControllers.getAllUniqueNationalities);

export const NationalityRoutes =router