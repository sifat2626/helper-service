import prisma from './prisma';

export const isDataReferenced = async (
  model: string,
  idField: string,
  idValue: string,
  referencingModels: { model: string; field: string }[]
): Promise<boolean> => {
  for (const reference of referencingModels) {
    // @ts-ignore
    const count = await prisma[reference.model].count({
      where: {
        [reference.field]: idValue,
      },
    });

    if (count > 0) {
      console.log(
        `Data from model ${model} is referenced in ${reference.model}.${reference.field}.`
      );
      return true;
    }
  }
  return false;
};