import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";

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
app.use(
   session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET,
   })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

//import routes
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import volunterRouter from "./routes/volunteer.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import messageRouter from "./routes/message.routes.js";
import programRouter from "./routes/program.routes.js";
import teamRouter from "./routes/team.routes.js";
import adminRouter from "./routes/admin.routes.js";
import googleAuthRouter from "./routes/google.auth.routes.js";

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/volunteer", volunterRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/program", programRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/auth/google", googleAuthRouter);

export { app };
