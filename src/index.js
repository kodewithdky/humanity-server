import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
import { app } from "./app.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

//dotenv config
dotenv.config({ path: "./.env" });

connectDB()
   .then(() => {
      app.listen(process.env.PORT || 7072, () => {
         console.log(
            `\n◔ SERVER IS RUNNING ON PORT: ${process.env.PORT}`.bgBlue.white
         );
      });
   })
   .catch((error) => {
      console.log(`\n🔗 MONGODB CONNECTION FAILED!!! ${error}`.bgRed.white);
   });

//error middleware
app.use(errorMiddleware);
