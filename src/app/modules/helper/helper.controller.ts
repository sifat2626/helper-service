import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { HelperServices } from './helper.service';

const createHelper = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await HelperServices.createHelper(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Maid Created',
    data: result,
  });
});

const getAllHelpers = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await HelperServices.getAllHelpers(userId,req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'helpers retrieved successfully',
    data: result,
  });
});

const addHelperToFavorites = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const maidId = req.params.maidId;
  const result = await HelperServices.addHelperToFavorites(userId,maidId)
  sendResponse(res, {
    statusCode:201,
    message:'added to favorites',
    data: result,
  })
})

export const HelperControllers = {
  createHelper,
  getAllHelpers,
  addHelperToFavorites
};
