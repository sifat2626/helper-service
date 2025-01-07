import catchAsync from '../../utils/catchAsync';
import { Services } from './service.service';
import sendResponse from '../../utils/sendResponse';

const createService = catchAsync(async (req, res) => {
  const {name} = req.body;
  const result = await Services.createService(name);
  sendResponse(res,{
    statusCode:201,
    message:'Service created successfully',
    data:result,
  })
})

const getAllServices = catchAsync(async (req, res) => {
  const result = await Services.getAllServices(req.query);
  sendResponse(res,{
    statusCode:200,
    message:'All services fetched!',
    data:result,
  })
})


export const ServiceControllers = {
  createService,
  getAllServices
}