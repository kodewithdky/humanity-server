import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../middlewares/error.middleware.js";
import { Volunteer } from "../models/volunteer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import fs from "fs";

//volunteer
const resgisterAsVolunteer = asyncHandler(async (req, res, next) => {
   const {
      name,
      email,
      phone,
      gender,
      fname,
      mname,
      dob,
      address,
      city,
      state,
      pincode,
      qualification,
      skills,
   } = req.body;
   if (
      !name ||
      !email ||
      !phone ||
      !gender ||
      !fname ||
      !mname ||
      !dob ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !qualification ||
      !skills
   ) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields are requird!")
      );
   }
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
   const volunteer = await Volunteer.findOne({
      $or: [{ email }, { phone }],
   });
   if (volunteer) {
      fs.unlinkSync(avatarLocalPath);
      return next(
         new ApiError(StatusCodes.CONFLICT, "User already a volunteer!")
      );
   }
   let avatar;
   if (avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath);
   }
   const newVolunteer = await Volunteer.create({
      avatar: { public_id: avatar?.public_id, url: avatar?.secure_url },
      name,
      email,
      phone,
      gender,
      fname,
      mname,
      dob,
      address,
      city,
      state,
      pincode,
      qualification,
      skills,
   });
   const createdVolunteer = await Volunteer.findById(newVolunteer._id);
   if (!createdVolunteer) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while become volunteer!"
         )
      );
   }
   return res
      .status(StatusCodes.CREATED)
      .json(
         new ApiResponse(
            StatusCodes.CREATED,
            createdVolunteer,
            "User become a volunteer successfully!"
         )
      );
});

export { resgisterAsVolunteer };
