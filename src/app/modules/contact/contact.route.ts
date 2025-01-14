import express from 'express';
import { ContactControllers } from './contact.controller';

const router = express.Router();

router.post('/',ContactControllers.contactUs)

export const ContactRoutes =router