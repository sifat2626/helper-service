import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { HelperServices } from './helper.service';
import { Request } from 'express';
import AppError from '../../errors/AppError';
import { NationalityServices } from '../nationality/nationality.service';

declare module 'express-serve-static-core' {
  interface Request {
    files?: {
      image?: Express.Multer.File[];
      pdf?: Express.Multer.File[];
    };
  }
}

const createHelper = catchAsync(async (req: Request, res) => {
  const bodyData = JSON.parse(req.body.data);

  const photo = req.files?.image?.[0];
  const biodata = req.files?.pdf?.[0];

  if (!photo) {
    throw new AppError(400, 'Photo is required.');
  }

  const result = await HelperServices.createHelper(bodyData, photo, biodata);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Maid created successfully',
    data: result,
  });
});

const createHelpers = catchAsync(async (req: Request, res) => {
  if (!req.file) {
    throw new AppError(400, 'CSV file is required.');
  }

  const helpers: any[] = [];
  const errors: string[] = [];

  const csvData = req.file.buffer.toString('utf8');
  const csvRows = csvData.split('\n');
  const headers = csvRows[0]?.split(',').map(header => header.trim());

  if (!headers || headers.length === 0) {
    throw new AppError(400, 'Invalid CSV format.');
  }


  for (let i = 1; i < csvRows.length; i++) {
    const row = csvRows[i].split(',');
    if (row.length !== headers.length) {
      errors.push(`Row ${i + 1} does not match header length.`);
      continue;
    }

    const helper = headers.reduce((acc: any, header: string, index: number) => {
      acc[header] = row[index]?.trim();
      return acc;
    }, {});

    if (
      !helper.name ||
      !helper.age ||
      !helper.nationality ||
      !helper.workHistory ||
      !helper.experience ||
      !helper.serviceNames
    ) {
      errors.push(`Row ${i + 1} is missing required fields.`);
      continue;
    }

    // Split `serviceNames` into an array using ';' as the delimiter
    helper.serviceNames = helper.serviceNames
      .split(';')
      .map((service: string) => service.trim());

    helpers.push(helper);
  }

  const serviceResult = await HelperServices.bulkCreateHelpers(helpers);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: `${serviceResult.successCount} helpers uploaded successfully.`,
    data: { errors: serviceResult.errors },
  });
});


const getAllHelpers = catchAsync(async (req: Request, res) => {
  const result = await HelperServices.getAllHelpers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Helpers retrieved successfully',
    data: result,
  });
});

const updateHelper = catchAsync(async (req: Request, res) => {
  const { id } = req.params;

  // Validate request body
  if (!req.body.data && !req.files) {
    throw new AppError(400, 'At least one field is required to update.');
  }

  const bodyData = JSON.parse(req.body.data);


  const photo = req.files?.image?.[0];
  const biodata = req.files?.pdf?.[0];

  // Validate photo if provided
  if (photo && !photo.mimetype.startsWith('image/')) {
    throw new AppError(400, 'Invalid file type for photo. Only images are allowed.');
  }

  // Validate biodata if provided
  if (biodata && biodata.mimetype !== 'application/pdf') {
    throw new AppError(400, 'Invalid file type for biodata. Only PDF files are allowed.');
  }

  // Call the service layer to handle the update
  const result = await HelperServices.updateHelper(id, bodyData, photo, biodata);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Helper updated successfully',
    data: result,
  });
});

const deleteHelper = catchAsync(async (req: Request, res) => {
  const { id } = req.params;
  const result = await HelperServices.deleteHelper(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Helper deleted successfully',
    data: null
  });
});

const addHelperToFavorites = catchAsync(async (req: Request, res) => {
  const userId = req.user.id;
  const maidId = req.params.maidId;

  const result = await HelperServices.addHelperToFavorites(userId, maidId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Helper added to favorites',
    data: result,
  });
});

const removeHelperFromFavorites = catchAsync(async (req: Request, res) => {
  const userId = req.user.id;
  const maidId = req.params.maidId;

  const result = await HelperServices.removeHelperFromFavorites(userId, maidId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Helper removed from favorites',
    data: result,
  });
});

const bookHelper = catchAsync(async (req: Request, res) => {
  const userId = req.user.id;
  const maidId = req.params.maidId;

  const result = await HelperServices.bookHelper(userId, maidId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Helper booked successfully',
    data: result,
  });
});


export const HelperControllers = {
  createHelper,
  createHelpers,
  getAllHelpers,
  updateHelper,
  deleteHelper,
  addHelperToFavorites,
  removeHelperFromFavorites,
  bookHelper,
};
