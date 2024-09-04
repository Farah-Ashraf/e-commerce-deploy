import dotenv from "dotenv";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

//sometiems the cloudinary file will run before the index.js so he will not
//know any .env variables at first, so importing dotenv will resolve the path
//of the .env file and start read the variables like CLOUD_NAME
dotenv.config({ path: path.resolve("./config/.env") });
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default cloudinary;
