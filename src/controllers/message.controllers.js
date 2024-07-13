import { StatusCodes } from "http-status-codes";
import ApiError from "../middlewares/error.middleware.js";
import { Message } from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//send message
const sendMessage = asyncHandler(async (req, res, next) => {
   const { name, email, phone, message } = req.body;
   if (!name || !email || !phone || !message) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Please fill all fields!")
      );
   }
   const data = await Message.create({ name, email, phone, message });
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, data, "message send successfully!")
      );
});

//get messages
const getMessages = asyncHandler(async (req, res, next) => {
   const messages = await Message.find({ __v: 0 });
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            messages,
            "Message fetched successfully!"
         )
      );
});

//delete message
const deleteMessage = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const message = await Message.findById({ _id: id });
   if (!message) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Message not found!"));
   }
   await message.deleteOne({ _id: id });
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Message deleted successfully")
      );
});

export { sendMessage, getMessages, deleteMessage };
