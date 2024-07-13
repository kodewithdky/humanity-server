import express from "express";
import passport from "passport";

//this import is important
//If you not import give error=> Unknown authentication strategy "google"
import "../services/google.passport.js";
import ApiError from "../middlewares/error.middleware.js";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse.js";

//express router
const router = express.Router();

//middlware
router.use(passport.initialize());
router.use(passport.session());

// Auth
router.get(
   "/",
   passport.authenticate("google", { scope: ["email", "profile"] })
);
// Auth Callback
router.get(
   "/callback",
   passport.authenticate("google", {
      successRedirect: "/auth/google/success",
      failureRedirect: "/auth/google/failure",
   })
);
// Success
router.get("/success", (req, res, next) => {
   if (!req.user) {
      return next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failure!"));
   }
   return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.OK, req.user, "Sign In successfully!"));
});
// failure
router.get("/failure", (req, res, next) => {
   return next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error!"));
});

export default router;
