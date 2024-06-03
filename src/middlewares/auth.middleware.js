import { User } from "../models/user.model.js";
import ApiError from "./error.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

//verify token
export const verifyJWT = asyncHandler(async (req, _, next) => {
   try {
      const token =
         req.cookies?.accessToken ||
         req.header("Authorization")?.replace("Bearer", "");
      //validate
      if (!token) {
         return next(
            new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized request!")
         );
      }
      //verify
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select(
         "-password -refreshToken"
      );
      if (!user) {
         return next(
            new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token!")
         );
      }
      req.user = user;
      next();
   } catch (error) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            error?.message || "Internal server error!"
         )
      );
   }
});

//is Logout
export const isLogout = asyncHandler(async (req, _, next) => {
   try {
      const token =
         req.cookies?.accessToken ||
         req.header("Authorization")?.replace("Bearer", "");
      //validate
      if (token) {
         throw new ApiError(
            401,
            "You are already login you can change password!"
         );
      }
      next();
   } catch (error) {
      throw new ApiError(401, error || "Error in logout!");
   }
});

//isAdmin
export const isAdmin = asyncHandler(async (req, _, next) => {
   try {
      //find admin user
      const user = await User.findById({ _id: req.user?._id });
      //valiate admin role
      if (user.is_admin !== 1) {
         throw new ApiError(401, "Unauthorized access!");
      }
      next();
   } catch (error) {
      throw new ApiError(401, error || "Error in admin access!");
   }
});
