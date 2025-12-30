import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 8082,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/sianfintech",
  env: process.env.NODE_ENV || "development"
};
