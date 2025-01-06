import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

const createHelper = async (
  userId: string,
  helperData: {
    age: number;
    nationality: string;
    experience: number;
    languages: string[];
    photo?: string;
    biodataUrl: string;
    availability: boolean;
  }
) => {
  // Step 1: Check if the user exists
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      Maid: true, // Include the Maid relation to check if it exists
    },
  });

  if (!user) {
    throw new AppError(400, 'User does not exist');
  }

  // Step 2: Ensure the user has the role 'MAID'
  if (user.role !== 'MAID') {
    throw new AppError(400, 'User must have the MAID role to create a Maid profile');
  }

  // Step 3: Check if a Maid profile already exists for the user
  if (user.Maid) {
    throw new AppError(400, 'Maid profile already exists for this user');
  }

  // Step 4: Create the Maid profile and link it to the User
  const maid = await prisma.maid.create({
    data: {
      age: helperData.age,
      nationality: helperData.nationality,
      experience: helperData.experience,
      languages: helperData.languages,
      photo: helperData.photo,
      biodataUrl: helperData.biodataUrl,
      availability: helperData.availability,
      user: {
        connect: {
          id: userId, // Link the Maid profile to the User
        },
      },
    },
  });

  return maid;
};

const getAllHelpers = async (userId: string, query: any) => {
  const { limit = 10, page = 1, minAge, maxAge, nationality, availability } = query;

  // Step 1: Validate if the user exists
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(400, 'User does not exist');
  }

  // Step 2: Build dynamic filters based on query parameters
  const filters: any = {};

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

  if (nationality) {
    filters.nationality = {
      contains: nationality,
      mode: "insensitive", // Case-insensitive filter
    };
  }

  if (availability !== undefined) {
    filters.availability = availability === 'true'; // Convert to boolean
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

const addHelperToFavorites = async (userId: string, maidId: string) => {
  // Step 1: Validate if the user exists and has the role of an employer
  console.log('AddHelperToFavorites', userId);
  const employer = await prisma.employer.findUnique({
    where: {
      userId: userId, // Check in the Employer table based on the userId
    },
  });

  if (!employer) {
    throw new AppError(400, 'Employer does not exist in the Employer table');
  }

  // Step 2: Validate if the maid exists
  const maid = await prisma.maid.findUnique({
    where: {
      id: maidId, // Validate the Maid ID
    },
  });

  if (!maid) {
    throw new AppError(400, 'Helper (maid) does not exist');
  }

  // Step 3: Check if the helper is already in the favorites list
  const existingFavorite = await prisma.employerFavorite.findFirst({
    where: {
      AND: [
        { employerId: employer.id }, // Match employerId
        { maidId: maidId },          // Match maidId
      ],
    },
  });

  if (existingFavorite) {
    throw new AppError(400, 'This helper is already in your favorites');
  }

  // Step 4: Add helper to favorites using `connect`
  const newFavorite = await prisma.employerFavorite.create({
    data: {
      employer: {
        connect: {
          id: employer.id, // Connect to the Employer table using employerId
        },
      },
      maid: {
        connect: {
          id: maidId, // Connect to the Maid table using maidId
        },
      },
    },
  });

  // Step 5: Return the updated list of favorites
  const updatedFavorites = await prisma.employerFavorite.findMany({
    where: {
      employerId: employer.id, // Filter by the current employer's ID
    },
    include: {
      maid: true, // Include maid details in the response
    },
  });

  return updatedFavorites;
};


export const HelperServices = {
  createHelper,
  getAllHelpers,
  addHelperToFavorites
};
