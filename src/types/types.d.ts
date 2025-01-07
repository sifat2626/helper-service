import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      files?: {
        image?: Express.Multer.File[];
        pdf?: Express.Multer.File[];
      };
    }
  }
}
