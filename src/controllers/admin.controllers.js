import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../middlewares/error.middleware.js";
import ExcelJs from "exceljs";
import { StatusCodes } from "http-status-codes";
import { cloudinary, uploadOnCloudinary } from "../services/cloudinary.js";
import { Payment } from "../models/paymet.model.js";
import { Volunteer } from "../models/volunteer.model.js";
import fs from "fs";

//get users
const getUsers = asyncHandler(async (req, res, next) => {
   let search = "";
   if (req.query.search) {
      search = req.query.search;
   }
   let page = 1;
   if (req.query.page) {
      page = req.query.page;
   }
   const limit = 6;
   const users = await User.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { phone: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
   const count = await User.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   }).countDocuments();
   return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
         users,
         totalPages: Math.ceil(count / limit),
         currentPage: page,
      })
   );
});

//get volunteers
const getVolunteers = asyncHandler(async (req, res, next) => {
   let search = "";
   if (req.query.search) {
      search = req.query.search;
   }
   let page = 1;
   if (req.query.page) {
      page = req.query.page;
   }
   const limit = 6;
   const volunteer = await Volunteer.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
         { fname: { $regex: ".*" + search + ".*", $options: "i" } },
         { mname: { $regex: ".*" + search + ".*", $options: "i" } },
         { address: { $regex: ".*" + search + ".*", $options: "i" } },
         { city: { $regex: ".*" + search + ".*", $options: "i" } },
         { pincode: { $regex: ".*" + search + ".*", $options: "i" } },
         { state: { $regex: ".*" + search + ".*", $options: "i" } },
         { gender: { $regex: ".*" + search + ".*", $options: "i" } },
         { dob: { $regex: ".*" + search + ".*", $options: "i" } },
         { qualification: { $regex: ".*" + search + ".*", $options: "i" } },
         { skills: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
   const count = await Volunteer.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
         { amount: { $regex: ".*" + search + ".*", $options: "i" } },
         {
            razorpay_payment_id: {
               $regex: ".*" + search + ".*",
               $options: "i",
            },
         },
         {
            razorpay_signature: { $regex: ".*" + search + ".*", $options: "i" },
         },
      ],
   }).countDocuments();
   return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
         volunteer,
         totalPages: Math.ceil(count / limit),
         currentPage: page,
      })
   );
});

//update volunter details
const updateVolunteerDetails = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
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
         new ApiError(StatusCodes.BAD_REQUEST, "All fields required!")
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
      fs.unlinkSync(avatarLocalPath);
      return next(new ApiError(StatusCodes.CONFLICT, "Please select file!"));
   }
   let avatar;
   if (avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath);
   }
   const volunteer = await Volunteer.findById({ _id: id });
   if (volunteer?.avatar?.public_id) {
      const avatarPublicId = volunteer?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarPublicId);
   }
   const updateVolunteer = await Volunteer.findByIdAndUpdate(
      { _id: id },
      {
         $set: {
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
         },
      },
      { new: true }
   );
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            updateVolunteer,
            "Volunteer details updated!"
         )
      );
});

//get payments
const getPayments = asyncHandler(async (req, res, next) => {
   let search = "";
   if (req.query.search) {
      search = req.query.search;
   }
   let page = 1;
   if (req.query.page) {
      page = req.query.page;
   }
   const limit = 20;
   const payments = await Payment.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
   const count = await Payment.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   }).countDocuments();
   return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
         payments,
         totalPages: Math.ceil(count / limit),
         currentPage: page,
      })
   );
});

//delete user
const deleteUser = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let user = await User.findById(id);
   if (user?.avatar?.public_id) {
      const avatarImagePublicId = user?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarImagePublicId);
   }
   await User.deleteOne({ _id: id });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "User deleted!"));
});

//delete  volunteer
const deleteVolunteer = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let volunteer = await Volunteer.findById(id);
   if (volunteer?.avatar?.public_id) {
      const avatarImagePublicId = volunteer?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarImagePublicId);
   }
   await Volunteer.deleteOne({ _id: id });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Volunteer deleted!"));
});

//change privlage
const changePrivlage = asyncHandler(async (req, res, next) => {
   const { value } = req.body;
   const { id } = req.params;
   const user = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { is_admin: value } },
      { new: true }
   ).select("-password -refreshToken");
   if (!user) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error while changing user privilage!"
         )
      );
   }
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            user,
            "change user privilage successfully!."
         )
      );
});



export {
   getUsers,
   getVolunteers,
   updateVolunteerDetails,
   getPayments,
   deleteUser,
   deleteVolunteer,
   changePrivlage,
};
