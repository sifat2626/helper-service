import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ContactServices } from './contact.service';

const contactUs = catchAsync(async (req, res) => {
  const result = await ContactServices.contactUs(req.body)
  sendResponse(res,{
    statusCode:200,
    message:"Email sent successfully",
    data:result
  })
})

export const ContactControllers = {
  contactUs,
}