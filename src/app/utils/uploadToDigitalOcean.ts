import AWS from 'aws-sdk';
import config from '../../config'; // Ensure your DigitalOcean credentials are in this config file

// Initialize the S3 client for DigitalOcean Spaces
const s3 = new AWS.S3({
  endpoint: config.DO_SPACE_ENDPOINT, // e.g., 'https://nyc3.digitaloceanspaces.com'
  accessKeyId: config.DO_SPACE_ACCESS_KEY,
  secretAccessKey: config.DO_SPACE_SECRET_KEY,
});

export const uploadFileToDigitalOcean = (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Define the upload parameters
    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.DO_SPACE_BUCKET as string, // Name of your Space
      Key: `${folder}/${Date.now()}-${file.originalname}`, // Unique file path
      Body: file.buffer, // File data
      ContentType: file.mimetype, // File MIME type
      ACL: 'public-read', // Make the file publicly accessible
    };

    // Upload the file to the Space
    s3.upload(params, (err, data) => {
      if (err) {
        reject(new Error(`DigitalOcean Spaces upload failed: ${err.message}`));
      } else {
        resolve(data.Location); // Resolve with the file's URL
      }
    });
  });
};
