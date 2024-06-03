import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
   try {
      const ConnectionInstance = await mongoose.connect(
         `${process.env.MONGODB_URI}/${DB_NAME}`
      );
      console.log(
         `\n🔛 DATABASE CONNECTED !! DB HOST: ${ConnectionInstance.connection.host}`
            .bgGreen.white
      );
   } catch (error) {
      console.log(`\n🔗 DATABASE CONNECTION ERROR ${error}`.bgRed.white);
      process.exit(1);
   }
};

export default connectDB;
