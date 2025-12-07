import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

loadEnv({ path: './.env', quiet: true });

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRY = process.env.JWT_EXPIRY;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const IMAGE_PATH = process.env.IMAGE_PATH;
export const LOGO_URL = process.env.LOGO_URL;
export const API_URL = process.env.API_URL;
export const MAP_API_KEY = process.env.MAP_API_KEY;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const FROM_EMAIL = process.env.FROM_EMAIL;
export const SENDGRID_API_KEY_HELLO = process.env.SENDGRID_API_KEY_HELLO;
export const FROM_EMAIL_HELLO = process.env.FROM_EMAIL_HELLO;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const AWS_REGION = process.env.AWS_REGION;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const smtpConfig = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
}

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE,
};
