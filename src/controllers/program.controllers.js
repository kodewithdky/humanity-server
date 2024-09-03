import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinary, uploadOnCloudinary } from "../services/cloudinary.js";
import ApiError from "../middlewares/error.middleware.js";
import { StatusCodes } from "http-status-codes";
import { Program } from "../../src/models/program.model.js";

//add program
const addProgram = asyncHandler(async (req, res, next) => {
   const { title, description } = req.body;
   if (!title || !description) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Title and description is required!"
         )
      );
   }
   let coverImageLocalPath;
   if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
   ) {
      coverImageLocalPath = req.files?.coverImage[0]?.path;
   }
   if (req.files.coverImage[0].path) {
      coverImageLocalPath = req.files.coverImage[0].path;
   }
   if (!coverImageLocalPath) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Cover image is required!")
      );
   }
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   const newProgram = await Program.create({
      title,
      description,
      coverImage: {
         public_id: coverImage?.public_id,
         url: coverImage?.secure_url,
      },
   });

   if (!newProgram) {
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
            newProgram,
            "Program added successfully!"
         )
      );
});

//get program
const getAllProgram = asyncHandler(async (req, res) => {
   const program = await Program.find();
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, program, "Fetched program!"));
});

//delete program
const deleteProgram = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let program = await Program.findById(id);
   if (program?.coverImage?.public_id) {
      const coverImagePublicId = program.coverImage.public_id;
      await cloudinary.uploader.destroy(coverImagePublicId);
   }
   await Program.deleteOne({ _id: id });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Program deleted!"));
});

export { addProgram, getAllProgram, deleteProgram };
