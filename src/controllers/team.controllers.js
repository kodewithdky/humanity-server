import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinary, uploadOnCloudinary } from "../services/cloudinary.js";
import ApiError from "../middlewares/error.middleware.js";
import { StatusCodes } from "http-status-codes";
import { Team } from "../models/team.model.js";

//add team
const addTeam = asyncHandler(async (req, res, next) => {
   const { name, role } = req.body;

   if (!name || !role) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Name and role is required!")
      );
   }
   let avatarImageLocalPath;
   if (
      req.files &&
      Array.isArray(req.files.avatar) &&
      req.files.avatar.length > 0
   ) {
      avatarImageLocalPath = req.files?.avatar[0]?.path;
   }
   if (!avatarImageLocalPath) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Avatar image is required!")
      );
   }
   const avatarImage = await uploadOnCloudinary(avatarImageLocalPath);
   const newteam = await Team.create({
      name,
      role,
      avatar: {
         public_id: avatarImage?.public_id,
         url: avatarImage?.secure_url,
      },
   });

   if (!newteam) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while createing program!"
         )
      );
   }
   return res
      .status(StatusCodes.CREATED)
      .json(
         new ApiResponse(
            StatusCodes.CREATED,
            newteam,
            "Team added successfully!"
         )
      );
});

//get team
const getAllTeam = asyncHandler(async (req, res) => {
   const team = await Team.find();
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, team, "Fetched program!"));
});

//delete team
const deleteTeam = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let team = await Team.findById(id);
   if (team?.avatar?.public_id) {
      const avatarImagePublicId = team?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarImagePublicId);
   }
   await Team.deleteOne({ _id: id });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Team deleted!"));
});

export { addTeam, getAllTeam, deleteTeam };
