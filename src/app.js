import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

//app
const app = express();
//middleware
app.use(
   cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
   })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

//import routes
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import volunterRouter from "./routes/volunteer.routes.js";
import jouinusRouter from "./routes/joinus.routes.js";
import adminRouter from "./routes/admin.routes.js";

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/volunteer", volunterRouter);
app.use("/api/v1/joinus", jouinusRouter);
app.use("/api/v1/admin", adminRouter);

export { app };
