import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { cloudinary, uploadOnCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import fs from "fs";

//genrate access and refresh token
const generateAcessAndRefreshTokens = async (userId) => {
   const user = await User.findById(userId);
   const accessToken = user.generateAccessToken();
   const refreshToken = user.generateRefreshToken();
   user.refreshToken = refreshToken;
   await user.save({ validateBeforeSave: false });
   return { accessToken, refreshToken };
};

//change user password
const changeUserPassword = asyncHandler(async (req, res, next) => {
   const { oldPassword, newPassword, confirmPassword } = req.body;
   if (!oldPassword && !newPassword) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Old password and new password is required!"
         )
      );
   }
   if (newPassword !== confirmPassword) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "New password and confirm password does not math!"
         )
      );
   }
   const user = await User.findById(req.user?._id);
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
   if (!isPasswordCorrect) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentils!")
      );
   }
   user.password = newPassword;
   await user.save({ validateBeforeSave: false });
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Password change successfully!")
      );
});

//update account
const updateAccountDetails = asyncHandler(async (req, res, next) => {
   const { name, gender, email, phone } = req.body;
   if (!name || !gender || !email || !phone) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields are required!")
      );
   }
   console.log(req.files.avatar)
   let avatarLocalPath;
   console.log("avatarLocalPath: ", avatarLocalPath);
   if (
      req.files &&
      Array.isArray(req.files.avatar) &&
      req.files.avatar.length > 0
   ) {
      avatarLocalPath = req.files?.avatar[0]?.path;
   }
   if (!avatarLocalPath) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Please select file!"));
   }
   let avatar;
   if (avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath);
   }
   const user = await User.findById(req.user?._id);
   if (user?.avatar?.public_id) {
      const avatarPublicId = user?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarPublicId);
   }
   const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            name,
            email,
            phone,
            gender,
            avatar: { public_id: avatar?.public_id, url: avatar?.secure_url },
         },
      },
      { new: true }
   ).select("-password -refreshToken");
   const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(
      updatedUser._id
   );
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            { user: updatedUser, accessToken, refreshToken },
            "Account details updated!"
         )
      );
});

//add avatar
const addAvatar = asyncHandler(async (req, res, next) => {
   let avatarLocalPath;
   if (
      req.files &&
      Array.isArray(req.files.avatar) &&
      req.files.avatar.length > 0
   ) {
      avatarLocalPath = req.files?.avatar[0]?.path;
   }
   if (!avatarLocalPath) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Please select file!"));
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   if (!avatar) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error While add avatar!"
         )
      );
   }
   await User.findByIdAndUpdate(req.user?._id, {
      $set: {
         avatar: { public_id: avatar?.public_id, url: avatar?.secure_url },
      },
   });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Avatar added successfully!"));
});

//update avatar
const updateAvatar = asyncHandler(async (req, res, next) => {
   let avatarLocalPath;
   if (
      req.files &&
      Array.isArray(req.files.avatar) &&
      req.files.avatar.length > 0
   ) {
      avatarLocalPath = req.files?.avatar[0]?.path;
   }
   if (!avatarLocalPath) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Please select file!"));
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   if (!avatar.url) {
      return next(
         StatusCodes.INTERNAL_SERVER_ERROR,
         "Error while uploading avatar!"
      );
   }
   const user = await User.findById(req.user?._id);
   if (user?.avatar?.public_id) {
      const avatarPublicId = user?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarPublicId);
   }
   await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avatar: { public_id: avatar?.public_id, url: avatar?.secure_url },
         },
      },
      { new: true }
   );
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Avatar updated successfully!")
      );
});

//get user
const getUser = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user?._id).select(
      "-password -refreshToken"
   );
   if (!user) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong!"
         )
      );
   }
   const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(
      user._id
   );
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            { user, accessToken, refreshToken },
            "Fetched user!"
         )
      );
});

//delete avatar
const deleteAvatar = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user?._id);
   if (user?.avatar?.public_id) {
      const avatarPublicId = user?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarPublicId);
   }
   await User.findByIdAndUpdate(req.user?._id, {
      $set: { avatar: "" },
   });
   if (!result) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error while deleting avatar!"
         )
      );
   }
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, result, "Avatar deleted successfully!")
      );
});

export {
   changeUserPassword,
   updateAccountDetails,
   addAvatar,
   deleteAvatar,
   getUser,
   updateAvatar,
};
