import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { HelperServices } from './helper.service';
import { Request } from 'express';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma'; // Import the extended Request type

declare module 'express-serve-static-core' {
  interface Request {
    files?: {
      image?: Express.Multer.File[];
      pdf?: Express.Multer.File[];
    };
  }
}

const createHelper = catchAsync(async (req: Request, res) => {
  // Parse the body data from the form-data field named "data"
  const bodyData = JSON.parse(req.body.data);

  // Extract the first file from each field
  const photo = req.files?.image?.[0]; // Safely get the first image file
  let  biodata = req.files?.pdf?.[0]; // Safely get the first PDF file

  // Ensure both photo and biodata files are provided
  if (!photo ) {
    return res.status(400).json({
      success: false,
      message: 'Photo is required.',
    });
  }


  // Call the service function
  const result = await HelperServices.createHelper(bodyData, photo, biodata);

  // Send the response
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Maid Created',
    data: result,
  });
});

const createHelpers = catchAsync(async (req: Request, res) => {
  if (!req.file) {
    throw new AppError(400, 'File not found');
  }

  const helpers: any[] = [];
  const errors: any[] = [];

  const stream = req.file.buffer.toString('utf8');
  const csvRows = stream.split('\n');
  const headers = csvRows[0]?.split(',').map(header => header.trim());

  // console.log(headers);

  if (!headers || headers.length < 1) {
    throw new AppError(400, 'Invalid CSV format.');
  }

  // process csv skipping the header
  for (let i = 1; i < csvRows.length; i++) {
    const row = csvRows[i].split(',');
    // console.log(row);
    if (row.length !== headers.length) {
      errors.push(`Row ${row.length} does not match the header`);
      continue;
    }
    const helper = headers.reduce((acc: any, header: string, index: number) => {
      acc[header] = row[index]?.trim();
      return acc;
    }, {});

    // console.log(helper);

    if (
      !helper.name ||
      !helper.email ||
      !helper.age ||
      !helper.experience ||
      !helper.serviceName ||
      !helper.photo ||
      !helper.biodataUrl
    ) {
      errors.push(`Row ${i + 1} is missing required fields.`);
      continue;
    }

    helpers.push(helper);
  }

  const serviceResult = await HelperServices.bulkCreateHelpers(helpers);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: `${serviceResult.successCount} helpers uploaded successfully.`,
    data: { errors: serviceResult.errors },
  });
});

const getAllHelpers = catchAsync(async (req, res) => {
  const result = await HelperServices.getAllHelpers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'helpers retrieved successfully',
    data: result,
  });
});

const updateHelper = catchAsync(async (req: Request, res) => {
  const { id } = req.params;

  // Validate and parse `req.body.data`
  if (!req.body.data) {
    throw new AppError(400, 'Data field is required.');
  }

  let helperData;
  try {
    helperData = JSON.parse(req.body.data);
  } catch (error) {
    throw new AppError(400, 'Invalid JSON format for data field.');
  }

  // Files from the request
  const photo = req.files?.image?.[0];
  const biodata = req.files?.pdf?.[0];

  // Validate file types
  if (photo && !photo.mimetype.startsWith('image/')) {
    throw new AppError(400, 'Invalid file type for photo. Only images are allowed.');
  }

  if (biodata && biodata.mimetype !== 'application/pdf') {
    throw new AppError(400, 'Invalid file type for biodata. Only PDF files are allowed.');
  }

  // Call the service to update the helper
  const result = await HelperServices.updateHelper(id, helperData, photo, biodata);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Helper updated successfully.',
    data: result,
  });
});



const deleteHelper = catchAsync(async (req: Request, res) => {
  const { id } = req.params;
  const result = await HelperServices.deleteHelper(id);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    message: 'helpers deleted successfully',
    data: result,
  });
})
//
const addHelperToFavorites = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const maidId = req.params.maidId;
  const result = await HelperServices.addHelperToFavorites(userId,maidId)
  sendResponse(res, {
    statusCode:201,
    message:'added to favorites',
    data: result,
  })
})

const removeHelperFromFavorites = catchAsync(async (req: Request, res) => {
  const userId = req.user.id;
  const maidId = req.params.maidId;
  const result = await HelperServices.removeHelperFromFavorites(userId,maidId)
  sendResponse(res, {
    statusCode:201,
    message:'removed from favorites',
    data: result,
  })
})

const bookHelper = catchAsync(async (req: Request, res) => {
  const userId = req.user.id;
  const maidId = req.params.maidId;
  const result = await HelperServices.bookHelper(userId, maidId);
  sendResponse(res, {
    statusCode:201,
    message:'booked maid successfully',
    data: result,
  })
})

export const HelperControllers = {
  createHelper,
  createHelpers,
  getAllHelpers,
  updateHelper,
  deleteHelper,
  addHelperToFavorites,
  removeHelperFromFavorites,
  bookHelper
};
