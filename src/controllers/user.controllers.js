import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { cloudinary, uploadOnCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

//change user password
const changeUserPassword = asyncHandler(async (req, res, next) => {
   const { oldPassword, newPassword } = req.body;
   if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Old password and new password is required!"
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
   if ([name, email].some((field) => field?.trim() === "")) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Name and email is required!")
      );
   }
   if ([name, gender, email, phone].some((field) => field?.trim() === "")) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields are required!")
      );
   }
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            name: name || req.user?.name,
            email: email || req.user?.email,
            phone: phone || req.user?.phone,
            gender: gender || req.user?.gender,
         },
      },
      { new: true }
   ).select("-password -refreshToken");
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            user,
            "Account details updated successfully!"
         )
      );
});

//add avatar
const addAvatar = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user?._id);
   if (user.avatar) {
      return next(new ApiError(StatusCodes.CONFLICT, "Avatar already exist!"));
   }
   if (!req.files) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Please select any image!")
      );
   }
   const avatarLocalPath = req.files?.avatar[0]?.path;
   const path = await uploadOnCloudinary(avatarLocalPath);
   if (!path) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error While add avatar!"
         )
      );
   }
   await User.findByIdAndUpdate(req.user?._id, {
      $set: { avatar: path.secure_url },
   });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Avatar added successfully!"));
});

//add cover image
const addCoverImage = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user?._id);
   if (user.coverImage) {
      return next(
         new ApiError(StatusCodes.CONFLICT, "Cover image already exist!")
      );
   }
   if (!req.files) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Please select any image!")
      );
   }
   const coverLocalPath = req.files?.coverImage[0]?.path;
   const path = await uploadOnCloudinary(coverLocalPath);
   if (!path) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error While add cover image!"
         )
      );
   }
   await User.findByIdAndUpdate(req.user?._id, {
      $set: { coverImage: path.secure_url },
   });
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Cover image added successfully!")
      );
});

//delete avatar
const deleteAvatar = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user?._id);
   let avatarUrl = user.avatar;
   const avatarArray = avatarUrl.split("/");
   const avatarImage = avatarArray[avatarArray.length - 1];
   const avatarPublicId = avatarImage.split(".")[0];
   const result = await cloudinary.uploader.destroy(avatarPublicId);
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

//delete cover image
const deleteCoverImage = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user?._id);
   let coverImageUrl = user.coverImage;
   const coverImageArray = coverImageUrl.split("/");
   const coverImage = coverImageArray[coverImageArray.length - 1];
   const coverImagePublicId = coverImage.split(".")[0];
   const result = await cloudinary.uploader.destroy(coverImagePublicId);
   await User.findByIdAndUpdate(req.user?._id, {
      $set: { coverImage: "" },
   });
   if (!result) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error while deleting cover image!"
         )
      );
   }
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, result, "Avatar deleted successfully!")
      );
});

//update avatar
const updateAvatar = asyncHandler(async (req, res, next) => {
   if (!req.files) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Please select any image!")
      );
   }
   const avatarLocalPath = req.files?.avatar[0]?.path;
   if (!avatarLocalPath) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Avatar file is missing!")
      );
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   if (!avatar.url) {
      return next(
         StatusCodes.INTERNAL_SERVER_ERROR,
         "Error while uploading avatar!"
      );
   }
   const user = await User.findById(req.user?._id);
   let avatarUrl = user.avatar;
   const avatarArray = avatarUrl.split("/");
   const avatarImage = avatarArray[avatarArray.length - 1];
   const avatarPublicId = avatarImage.split(".")[0];
   const result = await cloudinary.uploader.destroy(avatarPublicId);
   await User.findByIdAndUpdate(req.user?._id, {
      $set: { avatar: "" },
   });
   await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { avatar: avatar.secure_url } },
      { new: true }
   );
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Avatar updated successfully!")
      );
});

//update coverImage
const updateCoverImage = asyncHandler(async (req, res, next) => {
   if (!req.files) {
      return next(StatusCodes.BAD_REQUEST, "Please select any image!");
   }
   const coverImageLocalPath = req.files?.coverImage[0]?.path;
   if (!coverImageLocalPath) {
      return next(StatusCodes.BAD_REQUEST, "Avatar file is missing!");
   }
   const coverImagePath = await uploadOnCloudinary(coverImageLocalPath);
   if (!coverImagePath.secure_url) {
      return next(
         StatusCodes.INTERNAL_SERVER_ERROR,
         "Error while uploading avatar!"
      );
   }
   const user = await User.findById(req.user?._id);
   let coverImageUrl = user.coverImage;
   const coverImageArray = coverImageUrl.split("/");
   const coverImage = coverImageArray[coverImageArray.length - 1];
   const coverImagePublicId = coverImage.split(".")[0];
   await cloudinary.uploader.destroy(coverImagePublicId);
   await User.findByIdAndUpdate(req.user?._id, {
      $set: { coverImage: "" },
   });
   await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { coverImage: coverImagePath.secure_url } },
      { new: true }
   );
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            {},
            "Cover image updated successfully!"
         )
      );
});

export {
   changeUserPassword,
   updateAccountDetails,
   addAvatar,
   addCoverImage,
   deleteAvatar,
   deleteCoverImage,
   updateAvatar,
   updateCoverImage,
};
