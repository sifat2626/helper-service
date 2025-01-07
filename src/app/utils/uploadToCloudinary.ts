import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import config from '../../config';

export const uploadFileToCloudinary = (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder, // Specify the folder
        resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw', // Determine type dynamically
      },
      (error, result) => {
        // Explicitly cast `error` to the expected type
        if (error as UploadApiErrorResponse | null) {
          reject(new Error(`Cloudinary upload failed: ${error?.message}`));
        } else if (result) {
          resolve(result.secure_url); // Resolve with the secure URL
        } else {
          reject(new Error('Unknown error occurred during Cloudinary upload.'));
        }
      }
    );

    // Write the file buffer to the upload stream
    stream.end(file.buffer);
  });
};
