import prisma from '../../utils/prisma';

const getAllUniqueNationalities = async () => {
  try {
    const result = await prisma.maid.groupBy({
      by: ['nationality'], // Group by the nationality field
    });

    // Extract the nationalities into an array
    const uniqueNationalities = result.map(item => item.nationality);

    return uniqueNationalities;
  } catch (error) {
    console.error('Error fetching unique nationalities:', error);
    throw error;
  }
};

export const NationalityServices = {
  getAllUniqueNationalities
}