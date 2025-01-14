import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NationalityServices } from './nationality.service';

const getAllUniqueNationalities = catchAsync(async (req, res) => {
  const result = await NationalityServices.getAllUniqueNationalities();
  sendResponse(res,{
    statusCode:200,
    message:'nationalities retrieved successfully',
    data:result
  })
})

export const NationalityControllers = {
  getAllUniqueNationalities
}