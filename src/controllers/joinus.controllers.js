import { asyncHandler } from "../utils/asyncHandler.js";
import { Joinus } from "../models/joinus.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import ApiError from "../middlewares/error.middleware.js";

//joinus
const joinus = asyncHandler(async (req, res, next) => {
   const { name, email, amount, phone, purpose } = req.body;
   console.log(name, email, phone, purpose, amount);
   if (
      [name, email, phone, purpose, amount].some(
         (field) => field?.trim() === ""
      )
   ) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields is required!")
      );
   }
   const joinus = await Joinus.create({
      name,
      email,
      phone,
      purpose,
      amount,
   });
   const newJoinus = await Joinus.findById(joinus._id);
   if (!newJoinus) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while joinus!"
         )
      );
   }
   return res
      .status(StatusCodes.CREATED)
      .json(
         new ApiResponse(
            StatusCodes.CREATED,
            newJoinus,
            "User become joinus successfully!"
         )
      );
});

export { joinus };
