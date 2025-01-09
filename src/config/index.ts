import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  sender_email:process.env.SenderEmail,
  sender_pass:process.env.SenderPass,

  DO_SPACE_ENDPOINT: process.env.DO_SPACE_ENDPOINT,
  DO_SPACE_ACCESS_KEY: process.env.DO_SPACE_ACCESS_KEY,
  DO_SPACE_SECRET_KEY: process.env.DO_SPACE_SECRET_KEY,
  DO_SPACE_BUCKET: process.env.DO_SPACE_BUCKET,

  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
};
