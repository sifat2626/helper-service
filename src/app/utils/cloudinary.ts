import { v2 as cloudinary } from 'cloudinary';
import config from '../../config';

console.log('Cloudinary upload service',config.api_key);

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});
