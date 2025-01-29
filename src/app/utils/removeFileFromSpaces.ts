import AWS from "aws-sdk";
import config from "../../config";
import AppError from "../errors/AppError";
import httpStatus from "http-status";

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(config.DO_SPACE_ENDPOINT as string);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: config.DO_SPACE_ACCESS_KEY,
  secretAccessKey: config.DO_SPACE_SECRET_KEY,
});

/**
 * Remove a file from DigitalOcean Spaces
 * @param fileUrl The full URL of the file to be deleted
 */
export const removeFileFromSpaces = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) {
    console.warn("File URL is empty, skipping deletion.");
    return;
  }

  try {
    // Extract the file key (filename) from the URL
    const urlParts = fileUrl.split("/");
    const fileKey = decodeURIComponent(urlParts[urlParts.length - 1]);

    if (!config.DO_SPACE_BUCKET) {
      throw new AppError(httpStatus.BAD_REQUEST, "DigitalOcean Spaces bucket name is not configured.");
    }

    const params = {
      Bucket: config.DO_SPACE_BUCKET, // Name of the DigitalOcean Space
      Key: fileKey, // Extracted file name from the URL
    };

    // Attempt to delete the file
    await s3.deleteObject(params).promise();
    console.log(`✅ File ${fileKey} deleted successfully from DigitalOcean Spaces.`);
  } catch (error) {
    console.error("❌ Error deleting file from DigitalOcean Spaces:", error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file from storage.");
  }
};
