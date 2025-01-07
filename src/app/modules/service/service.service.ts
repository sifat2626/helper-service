import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

const createService = async (service: string) => {
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

const getServiceIdByName = async (name: string) => {
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

export const Services = {
  createService,
  getAllServices,
  getServiceIdByName
}