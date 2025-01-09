import prisma from '../../utils/prisma';
import { Services } from '../service/service.service';
import { TService } from '../service/service.interface';
import { uploadFileToDigitalOcean } from '../../utils/uploadToDigitalOcean';
import { isDataReferenced } from '../../utils/checkReference';
import AppError from '../../errors/AppError';
import { UserRoleEnum } from '@prisma/client';
import { sendEmail } from '../../utils/sendEmail';

export const createHelper = async (
  helperData: TService,
  photo: Express.Multer.File,
  biodata?: Express.Multer.File,
) => {
  // Start a Prisma transaction
  const result = await prisma.$transaction(async prisma => {
    const existingMaid = await prisma.maid.findUnique({
      where: { email: helperData.email },
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
      photoUrl = await uploadFileToDigitalOcean(photo, 'maids/photos');
    }

    if (biodata) {
      biodataUrl = await uploadFileToDigitalOcean(biodata, 'maids/biodatas');
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
        availability: helperData.availability,
      },
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
          : `Helper created: ${result.name}`,
      );
      successCount++; // Increment success count
    } catch (error: any) {
      // Handle individual helper error
      errors.push(
        `Failed to insert or update helper with email ${helper.email}: ${error.message}`,
      );
    }
  }

  // Return the results
  return { successCount, errors };
};

const getAllHelpers = async (query: any) => {
  const {
    limit = 10,
    page = 1,
    minAge,
    maxAge,
    experience,
    serviceId,
    availability,
    name,
    id,
    email,
  } = query;

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
      mode: 'insensitive',
    };
  }

  if (id) {
    filters.id = id;
  }

  if (email) {
    filters.email = {
      contains: email,
      mode: 'insensitive',
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
    filters.serviceId = serviceId;
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

const updateHelper = async (
  id: string,
  helperData: Partial<TService>,
  photo?: Express.Multer.File,
  biodata?: Express.Multer.File,
) => {
  // Find the helper to update
  const existingHelper = await prisma.maid.findUnique({
    where: { id },
  });

  if (!existingHelper) {
    throw new Error('Helper not found.');
  }

  // Upload new photo or keep the existing one
  const photoUrl = photo
    ? await uploadFileToDigitalOcean(photo, 'maids/photos')
    : existingHelper.photo;

  // Upload new biodata or keep the existing one
  const biodataUrl = biodata
    ? await uploadFileToDigitalOcean(biodata, 'maids/biodatas')
    : existingHelper.biodataUrl;

  // Update the helper
  const updatedHelper = await prisma.maid.update({
    where: { id },
    data: {
      ...helperData,
      photo: photoUrl,
      biodataUrl,
    },
  });

  return updatedHelper;
};

const deleteHelper = async (id: string) => {
  const referencingModels = [
    { model: 'booking', field: 'maidId' },
    { model: 'favorite', field: 'maidId' },
  ];

  const isReferenced = await isDataReferenced(
    'maid',
    'id',
    id,
    referencingModels,
  );

  if (isReferenced) {
    throw new Error(
      'This maid cannot be deleted because it is referenced in other records.',
    );
  }

  return prisma.maid.delete({
    where: { id },
  });
};

const addHelperToFavorites = async (userId: string, maidId: string) => {
  const maid = await prisma.maid.findUnique({
    where: {
      id: maidId,
    },
  });

  if (!maid) {
    throw new AppError(400, 'Sorry! Maid not found');
  }

  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId: userId,
      maidId: maidId,
    },
  });

  if (existingFavorite) {
    throw new AppError(400, 'This maid is already in your favorites.');
  }

  const result = await prisma.favorite.create({
    data: {
      maid: {
        connect: {
          id: maidId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

const removeHelperFromFavorites = async (userId: string, maidId: string) => {
  const maid = await prisma.maid.findUnique({
    where: {
      id: maidId,
    },
  });

  if (!maid) {
    throw new AppError(400, 'Sorry! Maid not found');
  }

  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId: userId,
      maidId: maidId,
    },
  });

  if(!existingFavorite) {
    throw new AppError(400, 'This maid is not in your favorites.');
  }

  const result = await prisma.favorite.delete({
    where:{
     id:existingFavorite.id
    }
  })

  return result
}

const bookHelper = async (userId: string, maidId: string) => {
  return prisma.$transaction(async prisma => {
    // Check if maid exists and is available
    const maid = await prisma.maid.findFirst({
      where: {
        id: maidId,
        availability: true,
      },
    });

    if (!maid) {
      throw new AppError(
        400,
        'Sorry! Maid is either not found or unavailable.',
      );
    }

    // Create the booking
    const result = await prisma.booking.create({
      data: {
        maid: {
          connect: {
            id: maidId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        date: new Date(),
      },
    });

    // Set maid's availability to false
    // await prisma.maid.update({
    //   where: { id: maidId },
    //   data: { availability: false },
    // });

    // Notify all admins via email
    const admins = await prisma.user.findMany({
      where: {
        OR: [{ role: UserRoleEnum.ADMIN }, { role: UserRoleEnum.SUPERADMIN }],
      },
    });

    if (admins.length === 0) {
      console.warn('No admins found to notify.');
    } else {
      for (const admin of admins) {
        console.log(admin);
        if (admin.email) {
          try {
            await sendEmail(
              admin.email,
              'New Booking Notification',
              `A new booking has been made for maid ${maid.name} by user ${userId}.`,
            );
          } catch (error) {
            console.error(`Failed to send email to admin: ${admin.email}`);
          }
        } else {
          console.warn(
            `Admin with ID ${admin.id} has no associated user or email.`,
          );
        }
      }
    }

    return result;
  });
};

export const HelperServices = {
  createHelper,
  bulkCreateHelpers,
  getAllHelpers,
  updateHelper,
  deleteHelper,
  addHelperToFavorites,
  removeHelperFromFavorites,
  bookHelper
};
