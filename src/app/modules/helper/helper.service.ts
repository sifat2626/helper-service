import prisma from '../../utils/prisma';
import { Services } from '../service/service.service';
import { TService } from '../service/service.interface';
import { uploadFileToCloudinary } from '../../utils/uploadToCloudinary';
import AppError from '../../errors/AppError';

export const createHelper = async (
  helperData: TService,
  photo: Express.Multer.File,
  biodata: Express.Multer.File
) => {
  // Start a Prisma transaction
  const result = await prisma.$transaction(async prisma => {
    const existingMaid = await prisma.maid.findUnique({
      where: { email: helperData.email }
    });

    if (existingMaid) {
      throw new Error('A maid with this email already exists.');
    }

    let serviceId = await Services.getServiceIdByName(helperData.serviceName);
    if (!serviceId) {
      const service = await Services.createService(helperData.serviceName);
      serviceId = service.id;
    }

    let photoUrl = '';
    let biodataUrl = '';

    if (photo) {
      photoUrl = await uploadFileToCloudinary(photo, 'maids/photos');
    }

    if (biodata) {
      biodataUrl = await uploadFileToCloudinary(biodata, 'maids/biodatas');
    }

    const maid = await prisma.maid.create({
      data: {
        name: helperData.name,
        email: helperData.email,
        age: helperData.age,
        experience: helperData.experience,
        serviceId,
        photo: photoUrl,
        biodataUrl,
        availability: helperData.availability
      }
    });

    return maid;
  });

  return result;
};

const bulkCreateHelpers = async (helpers: any[]) => {
  const errors: string[] = [];
  let successCount = 0;

  for (const helper of helpers) {
    try {
      // Check if the service exists
      let service = await prisma.service.findUnique({
        where: { name: helper.serviceName },
      });

      // Create the service if it doesn't exist
      if (!service) {
        service = await prisma.service.create({
          data: { name: helper.serviceName },
        });
      }

      // Use upsert to either create or update the helper
      const result = await prisma.maid.upsert({
        where: { email: helper.email },
        update: {
          name: helper.name,
          age: Number(helper.age),
          experience: Number(helper.experience),
          serviceId: service.id,
          availability: helper.availability.toString().toLowerCase() === 'true',
          photo: helper.photo || '', // Default to empty string if not provided
          biodataUrl: helper.biodataUrl || '', // Default to empty string if not provided
        },
        create: {
          name: helper.name,
          email: helper.email,
          age: Number(helper.age),
          experience: Number(helper.experience),
          serviceId: service.id,
          availability: helper.availability.toString().toLowerCase() === 'true',
          photo: helper.photo || '', // Default to empty string if not provided
          biodataUrl: helper.biodataUrl || '', // Default to empty string if not provided
        },
      });

      console.log(
        result.email === helper.email
          ? `Helper updated: ${result.name}`
          : `Helper created: ${result.name}`
      );
      successCount++; // Increment success count
    } catch (error: any) {
      // Handle individual helper error
      errors.push(
        `Failed to insert or update helper with email ${helper.email}: ${error.message}`
      );
    }
  }

  // Return the results
  return { successCount, errors };
};



const getAllHelpers = async (query: any) => {
  const { limit = 10, page = 1, minAge, maxAge, experience, serviceId, availability, name, email } = query;

  // Step 1: Validate if the user exists
  // const user = await prisma.user.findUnique({
  //   where: {
  //     id: userId,
  //   },
  // });
  //
  // if (!user) {
  //   throw new AppError(400, 'User does not exist');
  // }

  // Step 2: Build dynamic filters based on query parameters
  const filters: any = {};

  if (name) {
    filters.name = {
      contains: name,
      mode: 'insensitive'
    };
  }

  if (email) {
    filters.email = {
      contains: email,
      mode: 'insensitive'
    };
  }

  if (minAge && maxAge) {
    filters.age = {
      gte: Number(minAge), // Greater than or equal to minAge
      lte: Number(maxAge), // Less than or equal to maxAge
    };
  } else if (minAge) {
    filters.age = {
      gte: Number(minAge),
    };
  } else if (maxAge) {
    filters.age = {
      lte: Number(maxAge),
    };
  }

  if (experience) {
    filters.experience = {
      gte: Number(experience),
    };
  }

  if (serviceId) {
    filters.serviceId = serviceId
  }

  if (availability !== undefined) {
    filters.availability = availability.toString() === 'true'; // Convert to boolean
  }

  // Step 3: Calculate pagination details
  const take = Number(limit); // Number of records per page
  const skip = (Number(page) - 1) * take; // Offset for pagination

  // Step 4: Fetch total count of filtered helpers
  const totalHelpers = await prisma.maid.count({
    where: filters, // Apply filters here
  });

  // Step 5: Fetch filtered and paginated helpers
  const helpers = await prisma.maid.findMany({
    where: filters, // Apply filters here
    skip: skip,
    take: take,
  });

  // Step 6: Prepare meta data
  const meta = {
    total: totalHelpers,
    limit: take,
    page: Number(page),
    totalPages: Math.ceil(totalHelpers / take),
  };

  // Step 7: Return result with meta data
  return {
    meta,
    data: helpers,
  };
};
//
// const addHelperToFavorites = async (userId: string, maidId: string) => {
//   // Step 1: Validate if the user exists and has the role of an employer
//   console.log('AddHelperToFavorites', userId);
//   const employer = await prisma.employer.findUnique({
//     where: {
//       userId: userId, // Check in the Employer table based on the userId
//     },
//   });
//
//   if (!employer) {
//     throw new AppError(400, 'Employer does not exist in the Employer table');
//   }
//
//   // Step 2: Validate if the maid exists
//   const maid = await prisma.maid.findUnique({
//     where: {
//       id: maidId, // Validate the Maid ID
//     },
//   });
//
//   if (!maid) {
//     throw new AppError(400, 'Helper (maid) does not exist');
//   }
//
//   // Step 3: Check if the helper is already in the favorites list
//   const existingFavorite = await prisma.employerFavorite.findFirst({
//     where: {
//       AND: [
//         { employerId: employer.id }, // Match employerId
//         { maidId: maidId },          // Match maidId
//       ],
//     },
//   });
//
//   if (existingFavorite) {
//     throw new AppError(400, 'This helper is already in your favorites');
//   }
//
//   // Step 4: Add helper to favorites using `connect`
//   const newFavorite = await prisma.employerFavorite.create({
//     data: {
//       employer: {
//         connect: {
//           id: employer.id, // Connect to the Employer table using employerId
//         },
//       },
//       maid: {
//         connect: {
//           id: maidId, // Connect to the Maid table using maidId
//         },
//       },
//     },
//   });
//
//   // Step 5: Return the updated list of favorites
//   const updatedFavorites = await prisma.employerFavorite.findMany({
//     where: {
//       employerId: employer.id, // Filter by the current employer's ID
//     },
//     include: {
//       maid: true, // Include maid details in the response
//     },
//   });
//
//   return updatedFavorites;
// };

export const HelperServices = {
  createHelper,
  bulkCreateHelpers,
  getAllHelpers,
  // addHelperToFavorites
};
