import prisma from '../../utils/prisma';
import { TService } from '../service/service.interface';
import { uploadFileToDigitalOcean } from '../../utils/uploadToDigitalOcean';
import { isDataReferenced } from '../../utils/checkReference';
import AppError from '../../errors/AppError';
import { UserRoleEnum } from '@prisma/client';
import { sendEmail } from '../../utils/sendEmail';

const createHelper = async (
  helperData: TService,
  photo: Express.Multer.File,
  biodata?: Express.Multer.File,
) => {
  // Step 1: Handle photo and biodata uploads
  const photoUrl = photo ? await uploadFileToDigitalOcean(photo, 'maids/photos') : '';
  const biodataUrl = biodata ? await uploadFileToDigitalOcean(biodata, 'maids/biodatas') : '';

  // Step 2: Create the maid in a transaction
  const maid = await prisma.maid.create({
    data: {
      name: helperData.name,
      email: helperData.email,
      age: helperData.age,
      nationality: helperData.nationality,
      experience: helperData.experience,
      photo: photoUrl,
      biodataUrl,
      availability: helperData.availability,
    },
  });

  const serviceNames =helperData.serviceNames.split(',')

  // Step 3: Handle multiple services outside the transaction
  if (helperData.serviceNames && helperData.serviceNames.length > 0) {
    for (const serviceName of serviceNames) {
      console.log('serviceName', serviceName);
      // Find or create the service
      const service = await prisma.service.upsert({
        where: { name: serviceName },
        update: {}, // No updates for existing service
        create: { name: serviceName.toLowerCase() },
      });

      // Create the relation in `maidService`
      await prisma.maidService.create({
        data: {
          maidId: maid.id,
          serviceId: service.id,
        },
      });
    }
  }

  return maid;
};


const bulkCreateHelpers = async (helpers: any[]) => {
  const errors: string[] = [];
  let successCount = 0;

  for (const helper of helpers) {
    console.log(helper);
    try {
      // Split the `serviceNames` string into an array using ';' as a delimiter
      const serviceNames:string[] = []
      helper.serviceNames.map((serviceName:string)=>{
        serviceNames.push(serviceName.trim().toLowerCase());
      })


      const maid = await prisma.maid.upsert({
        where: { email: helper.email },
        update: {
          name: helper.name,
          age: Number(helper.age),
          nationality: helper.nationality,
          experience: Number(helper.experience),
          availability: helper.availability.toString().toLowerCase() === 'true',
          photo: helper.photo || '',
          biodataUrl: helper.biodataUrl || '',
        },
        create: {
          name: helper.name,
          email: helper.email,
          age: Number(helper.age),
          experience: Number(helper.experience),
          availability: helper.availability.toString().toLowerCase() === 'true',
          photo: helper.photo || '',
          biodataUrl: helper.biodataUrl || '',
        },
      });

      // Iterate over the service names and associate them with the maid
      for (const serviceName of serviceNames) {
        let service = await prisma.service.findUnique({
          where: { name: serviceName },
        });

        if (!service) {
          service = await prisma.service.create({
            data: { name: serviceName },
          });
        }

        await prisma.maidService.upsert({
          where: {
            maidId_serviceId: {
              maidId: maid.id,
              serviceId: service.id,
            },
          },
          update: {},
          create: {
            maidId: maid.id,
            serviceId: service.id,
          },
        });
      }

      successCount++;
    } catch (error: any) {
      errors.push(
        `Failed to process helper with email ${helper.email}: ${error.message}`,
      );
    }
  }

  return { successCount, errors };
};


const getAllHelpers = async (query: any) => {
  const {
    limit = 10,
    page = 1,
    minAge,
    maxAge,
    nationality,
    experience,
    serviceNames, // Array of service names to filter
    availability,
    name,
    id,
    email,
  } = query;

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
      gte: Number(minAge),
      lte: Number(maxAge),
    };
  } else if (minAge) {
    filters.age = { gte: Number(minAge) };
  } else if (maxAge) {
    filters.age = { lte: Number(maxAge) };
  }

  if(nationality) {
    filters.nationality = {
      contains: nationality,
      mode: 'insensitive',
    }
  }

  if (experience) {
    filters.experience = { gte: Number(experience) };
  }

  if (availability !== undefined) {
    filters.availability = availability.toString() === 'true';
  }

  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  // Ensure serviceNames is an array
  const parsedServiceNames = Array.isArray(serviceNames)
    ? serviceNames
    : typeof serviceNames === 'string'
      ? JSON.parse(serviceNames) // Parse JSON string to array if passed as such
      : [];

  // If serviceNames is provided, filter to ensure the maid has all the specified services
  const serviceFilter =
    parsedServiceNames.length > 0
      ? {
          AND: parsedServiceNames.map((serviceName: any) => ({
            MaidServices: {
              some: {
                Service: {
                  name: {
                    equals: serviceName,
                    mode: 'insensitive',
                  },
                },
              },
            },
          })),
        }
      : {};

  // Merge service filter with other filters
  const finalFilters = { ...filters, ...serviceFilter };

  const totalHelpers = await prisma.maid.count({
    where: finalFilters,
  });

  const helpers = await prisma.maid.findMany({
    where: finalFilters,
    skip,
    take,
    include: {
      MaidServices: {
        include: {
          Service: true,
        },
      },
    },
  });

  return {
    meta: {
      total: totalHelpers,
      limit: take,
      page: Number(page),
      totalPages: Math.ceil(totalHelpers / take),
    },
    data: helpers,
  };
};



const updateHelper = async (
  id: string,
  helperData: Partial<TService>,
  photo?: Express.Multer.File,
  biodata?: Express.Multer.File
) => {
  // Check if the helper exists
  const existingHelper = await prisma.maid.findUnique({
    where: { id },
    include: {
      MaidServices: true, // Include existing services for the helper
    },
  });

  if (!existingHelper) {
    throw new AppError(404, 'Helper not found.');
  }

  const photoUrl = photo
    ? await uploadFileToDigitalOcean(photo, 'maids/photos')
    : existingHelper.photo; // Retain the existing photo URL if no new file

  const biodataUrl = biodata
    ? await uploadFileToDigitalOcean(biodata, 'maids/biodatas')
    : existingHelper.biodataUrl; // Retain the existing biodata URL if no new file

  // Update basic fields
  const updatedHelperData: any = {};
  if (helperData.name) updatedHelperData.name = helperData.name;
  if (helperData.email) updatedHelperData.email = helperData.email;
  if (helperData.age) updatedHelperData.age = Number(helperData.age);
  if (helperData.nationality) updatedHelperData.nationality = helperData.nationality;
  if (photoUrl) updatedHelperData.photo = photoUrl;
  if (biodataUrl) updatedHelperData.biodataUrl = biodataUrl;
  if (helperData.availability !== undefined) {
    updatedHelperData.availability = helperData.availability;
  }

  // Update the helper record
  const updatedHelper = await prisma.maid.update({
    where: { id },
    data: updatedHelperData,
  });

  // Handle service updates
  if (helperData.serviceNames && helperData.serviceNames.length > 0) {
    // Clear existing services
    await prisma.maidService.deleteMany({
      where: { maidId: id },
    });

    const serviceNames = helperData.serviceNames.split(',')

    // Process and associate new services
    for (const serviceName of serviceNames) {
      let service = await prisma.service.findUnique({
        where: { name: serviceName.trim().toLowerCase() },
      });

      if (!service) {
        // Create the service if it doesn't exist
        service = await prisma.service.create({
          data: { name: serviceName.trim().toLowerCase() },
        });
      }

      // Link the maid with the service
      await prisma.maidService.create({
        data: {
          maidId: id,
          serviceId: service.id,
        },
      });
    }
  }

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
      // include:{
      //   maid:true,
      //   user:true
      // }
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
