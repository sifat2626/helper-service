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

const updateService = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const result = await Services.updateService(id, name);

  sendResponse(res, {
    statusCode: 200,
    message: 'Service updated successfully',
    data: result,
  });
});

const deleteService = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await Services.deleteService(id);

  sendResponse(res, {
    statusCode: 200,
    message: result.message,
    data: result,
  });
});


export const ServiceControllers = {
  createService,
  getAllServices,
  updateService,
  deleteService
}