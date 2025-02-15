import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { isDataReferenced } from '../../utils/checkReference';
import { PrefferedServices } from '@prisma/client';

const createService = async (service: PrefferedServices) => {
  const exists = await prisma.service.findFirst({
    where:{
      name: service,
    }
  })

  if(exists){
    throw new AppError(400,'Service already exists');
  }
  const result = await prisma.service.create({
    data:{
      name: service,
    }
  })
  return result
}

const getAllServices = async(query:any)=>{
  const {limit = 10, page = 1} = query;
  const take = Number(limit);
  const skip = (Number(page)-1) * take;
  const result = await prisma.service.findMany({
    skip: skip,
    take: take,
  })
  const meta = {
    total: result?.length,
    limit:limit,
    page:page,
    totalPages: Math.ceil(result.length/take),
  }
  return {
    meta,
    data: result
  }

}

const getServiceIdByName = async (name: PrefferedServices) => {
  let service = await prisma.service.findFirst({
    where: {
      name: name
    }
  })

  if(!service){
    service = await createService(name)
  }

  return service.id
}

const updateService = async (id: string, name: PrefferedServices) => {
  const exists = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!exists) {
    throw new AppError(404, 'Service not found');
  }

  const duplicate = await prisma.service.findFirst({
    where: {
      name,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    throw new AppError(400, 'Service with this name already exists');
  }

  const updatedService = await prisma.service.update({
    where: { id },
    data: { name },
  });

  return updatedService;
};

const deleteService = async (id: string) => {
  // Define models and fields that reference the Service model
  const referencingModels = [
    { model: 'Maid', field: 'serviceId' }, // Maids reference the Service
  ];

  // Check if the Service is referenced in other models
  const isReferenced = await isDataReferenced('Service', 'id', id, referencingModels);

  if (isReferenced) {
    throw new AppError(400, 'Service cannot be deleted as it is referenced by other entities.');
  }

  // Proceed with deletion if not referenced
  await prisma.service.delete({
    where: { id },
  });

  return { message: 'Service deleted successfully' };
};


export const Services = {
  createService,
  getAllServices,
  getServiceIdByName,
  updateService,
  deleteService
}