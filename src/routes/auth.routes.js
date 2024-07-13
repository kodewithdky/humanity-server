import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { isLogout, verifyJWT } from "../middlewares/auth.middleware.js";
import {
   forgotPassword,
   logoutUser,
   refreshAccessToken,
   signin,
   sendOTP,
   sendVerificationLink,
   verifyEmail,
   signup,
} from "../controllers/auth.controllers.js";

const router = Router();
//routes
//signin user
router.route("/sign-up").post(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
   ]),
   signup
);

//verify email
router.route("/verify").get(verifyEmail);
//verification
router.route("/verification-link").post(sendVerificationLink);
//login
router.route("/sign-in").post(signin);
//logout
router.route("/logout").post(verifyJWT, logoutUser);
//send otp
router.route("/send-otp").post(isLogout, sendOTP);
// forgot password
router.route("/forgot-password").post(isLogout, forgotPassword);
//refresh access token
router.route("/refresh-token").post(refreshAccessToken);

export default router;
