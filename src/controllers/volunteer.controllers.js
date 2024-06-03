import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../middlewares/error.middleware.js";
import { Volunteer } from "../models/volunteer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

//volunteer
const resgisterAsVolunteer = asyncHandler(async (req, res, next) => {
   const { fname, mname, dob, address, qualification, skills } = req.body;
   if (
      [fname, mname, dob, address, qualification, skills].some(
         (field) => field?.trim() === ""
      )
   ) {
      return next(StatusCodes.BAD_REQUEST, "All fields is required!");
   }
   const userId = req.user?._id;
   const volunteer = await Volunteer.findOne({ userId });
   if (volunteer) {
      return next(
         new ApiError(StatusCodes.CONFLICT, "User already a volunteer!")
      );
   }
   const newVolunteer = await Volunteer.create({
      userId: userId,
      fname,
      mname,
      dob,
      address,
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
            "User become volunteer successfully!"
         )
      );
});

export { resgisterAsVolunteer };
